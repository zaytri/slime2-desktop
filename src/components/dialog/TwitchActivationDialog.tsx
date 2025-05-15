import { useAccountsDispatch } from '@/contexts/accounts/useAccountsDispatch';
import { TwitchActivationPayload } from '@/contexts/dialog/DialogType';
import { useDialog } from '@/contexts/dialog/useDialog';
import { Account, setTokens } from '@/helpers/json/accounts';
import { getUser, obtainTwitchTokens, verifyToken } from '@/helpers/twitchAuth';
import { memo, useEffect, useState } from 'react';
import DialogHeader from './DialogHeader';

const TwitchActivationDialog = memo(function TwitchActivationDialog() {
	const { payload, close } = useDialog<TwitchActivationPayload>();
	const [activating, setActivating] = useState(false);
	const { addAccount: set } = useAccountsDispatch();

	useEffect(() => {
		if (activating) {
			const activationLoop = setInterval(() => {
				obtainTwitchTokens(payload.deviceCode)
					.then(response => {
						setActivating(false);
						const { access_token, refresh_token, scope } = response.data;

						verifyToken(response.data.access_token).then(response => {
							const { user_id } = response.data;

							getUser(access_token, user_id).then(response => {
								const user = response.data.data[0];
								const account: Account = {
									id: user.id,
									username: user.login,
									displayName: user.display_name,
									image: user.profile_image_url,
									scopes: scope,
									service: 'twitch',
									type: 'read',
									reauthorize: false,
									widgets: [],
								};

								setTokens(account, access_token, refresh_token);
								set(account);
								close();
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
					{payload.userCode}
				</p>
				<p className='font-quicksand'>
					Click the button below and enter the activation code.
				</p>
				<a
					href={payload.verificationUri}
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
