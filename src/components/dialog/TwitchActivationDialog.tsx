import useAccounts from '@/contexts/accounts/useAccounts';
import { useAccountsDispatch } from '@/contexts/accounts/useAccountsDispatch';
import { useDialog } from '@/contexts/dialog/useDialog';
import { Account, setTokens } from '@/helpers/json/accounts';
import twitchApi from '@/helpers/services/twitch/twitchApi';
import twitchAuth from '@/helpers/services/twitch/twitchAuth';
import { memo, useEffect, useState } from 'react';
import AccountSuccessDialog from './AccountSuccessDialog';
import DialogHeader from './DialogHeader';

type TwitchActivationDialogProps = {
	deviceCode: string;
	userCode: string;
	verificationUri: string;
};

const TwitchActivationDialog = memo(function TwitchActivationDialog({
	deviceCode,
	userCode,
	verificationUri,
}: TwitchActivationDialogProps) {
	const { openDialog } = useDialog();
	const [activating, setActivating] = useState(false);
	const accounts = useAccounts();
	const { addAccount } = useAccountsDispatch();

	useEffect(() => {
		if (activating) {
			const activationLoop = setInterval(() => {
				twitchAuth
					.obtainDCFTokens(deviceCode)
					.then(response => {
						setActivating(false);
						const { access_token, refresh_token, scope } = response.data;

						twitchAuth
							.validateAccessToken(response.data.access_token)
							.then(async response => {
								const { user_id } = response.data;
								const serviceId = user_id;
								const service = 'twitch';
								const type = 'read';
								const accountId = `${service}_${type}_${serviceId}`;
								await setTokens(accountId, access_token, refresh_token);

								twitchApi.getUser(accountId, user_id).then(response => {
									const user = response.data.data[0];
									const existingAccount: Account | undefined =
										accounts[accountId];
									const account: Account = {
										id: accountId,
										type,
										service,
										serviceId,
										username: user.login,
										displayName: user.display_name,
										image: user.profile_image_url,
										scopes: scope,
										reauthorize: false,
										default: existingAccount ? existingAccount.default : false,
										widgets: existingAccount ? existingAccount.widgets : {},
									};

									addAccount(account);
									openDialog(<AccountSuccessDialog id={account.id} />);
								});
							});
					})
					.catch(() => {
						// user hasn't finished activation, ignore
					});
			}, 2000);

			return () => {
				clearInterval(activationLoop);
			};
		}
	}, [activating]);

	return (
		<div>
			<DialogHeader>Twitch Activation Code</DialogHeader>
			<div className='flex flex-col gap-3'>
				<p className='text-10 font-quicksand text-center font-medium tracking-widest'>
					{userCode}
				</p>
				<p className='font-quicksand'>
					Click the button below and enter the activation code.
				</p>
				<a
					href={verificationUri}
					target='_blank'
					className='rounded-2 over:translate-y-0.5 over:bg-none over:shadow-none flex-1 border-2 border-emerald-800 bg-lime-400 bg-linear-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-center text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800'
					onClick={() => {
						setActivating(true);
					}}
				>
					Activate
				</a>
				{activating && <p>Waiting for activation...</p>}
			</div>
		</div>
	);
});

export default TwitchActivationDialog;
