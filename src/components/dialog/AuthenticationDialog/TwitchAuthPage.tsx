import ExternalLink from '@/components/ExternalLink';
import DoubleSquareSvg from '@/components/svg/DoubleSquareSvg';
import useAccounts from '@/contexts/accounts/useAccounts';
import { useAccountsDispatch } from '@/contexts/accounts/useAccountsDispatch';
import { usePage } from '@/contexts/pages/usePage';
import { usePageContext } from '@/contexts/pages/usePageContext';
import { Account, generateAccountId, setTokens } from '@/helpers/json/accounts';
import twitchApi from '@/helpers/services/twitch/twitchApi';
import twitchAuth from '@/helpers/services/twitch/twitchAuth';
import { Description, Field, Input, Label } from '@headlessui/react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { memo, useEffect, useState } from 'react';
import { AuthenticationContext, AuthenticationPages } from '.';
import DialogCancelButton from '../DialogButton/DialogCancelButton';

const SERVICE: Account['service'] = 'twitch';

const TwitchAuthPage = memo(function TwitchAuthPage() {
	const { type, setAccountId } = usePageContext<AuthenticationContext>();
	const { setPage } = usePage<AuthenticationPages>();

	const accounts = useAccounts();
	const { addAccount } = useAccountsDispatch();

	const [dcf, setDcf] = useState<{
		device_code: string;
		user_code: string;
		verification_uri: string;
		expires_in: number;
		interval: number;
	}>();
	const [activating, setActivating] = useState(false);
	const [fetchingUser, setFetchingUser] = useState(false);
	const [copied, setCopied] = useState(false);

	const statusMessage = activating
		? 'Checking for authorization...'
		: fetchingUser
			? 'Authorized! Connecting account...'
			: null;

	useEffect(() => {
		twitchAuth.startDCF(type).then(response => {
			setDcf(response.data);
		});
	}, []);

	useEffect(() => {
		if (!dcf) return;

		const activationLoop = setInterval(() => {
			twitchAuth
				.obtainDCFTokens(type, dcf.device_code)
				.then(async response => {
					clearInterval(activationLoop);

					// successful response, user has authorized
					setActivating(false);
					setFetchingUser(true);

					const { access_token, refresh_token, scope } = response.data;
					const validationResponse =
						await twitchAuth.validateAccessToken(access_token);
					const { user_id } = validationResponse.data;

					const accountId = generateAccountId(SERVICE, type, user_id);
					await setTokens(accountId, access_token, refresh_token);

					const userResponse = await twitchApi.getUser(accountId, user_id);
					const user = userResponse.data.data[0];
					const existingAccount: Account | undefined = accounts[accountId];

					const account: Account = {
						id: accountId,
						type,
						service: SERVICE,
						serviceId: user_id,
						username: user.login,
						displayName: user.display_name,
						image: user.profile_image_url,
						scopes: scope,
						reauthorize: false,
						default: existingAccount ? existingAccount.default : false,
						widgets: existingAccount ? existingAccount.widgets : {},
					};

					addAccount(account);
					setAccountId(accountId);
					setPage('success');
				})
				.catch(() => {
					// user hasn't authorized yet, continue loop
				});
		}, 2000); // check every 2 seconds

		return () => {
			clearInterval(activationLoop);
		};
	}, [dcf]);

	if (!dcf) {
		return <p>Loading Twitch Activation...</p>;
	}

	return (
		<div className='flex w-full flex-1 flex-col gap-6'>
			<Field className='flex w-full flex-col gap-4'>
				<div className='flex flex-col'>
					<Label className='pl-2 text-4.5 font-semibold text-shadow-[0_1px_white]'>
						Activation Code
					</Label>
					<div className='input-wrapper flex w-full overflow-visible p-0'>
						<Input
							value={dcf.user_code}
							className='min-w-0 flex-1 pr-1 pl-2 text-7 font-bold tracking-[0.2em] input-class'
							readOnly
						/>
						<button
							type='button'
							className='relative flex rounded-2 border border-white bg-lime-200 bg-linear-to-b from-lime-200 to-lime-300 p-2 font-bold text-lime-800 outline-2 outline-offset-0! outline-lime-600 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
							onClick={async () => {
								await writeText(dcf.user_code);
								setCopied(true);
							}}
						>
							<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
							<div className='relative flex flex-1 items-center gap-2 text-4.5 drop-shadow-[0_1px_3px_#FFFB]'>
								<DoubleSquareSvg className='size-4.5' />
								<p>{copied ? 'Copied!' : 'Copy'}</p>
							</div>
						</button>
					</div>
				</div>
				<Description
					as='div'
					className='mx-0.5 rounded-2 border-2 border-zinc-300 bg-white px-3 py-2'
				>
					<ol className='list-decimal pl-4'>
						<li>
							<strong>Copy</strong> the activation code <strong>above</strong>.
						</li>
						<li>
							Go to{' '}
							<ExternalLink
								className='font-bold text-green-600 underline'
								href='https://www.twitch.tv/activate'
								onClick={() => {
									setActivating(true);
								}}
							>
								https://www.twitch.tv/activate
							</ExternalLink>
							.
						</li>
						<li>
							<strong>Paste</strong> the code and <strong>activate</strong>.
						</li>
						<li>
							<strong>Review</strong> the permissions and{' '}
							<strong>authorize</strong>.
						</li>
						<li>
							<strong>Return here</strong> to finish connecting.
						</li>
					</ol>
				</Description>
				{statusMessage && (
					<p className='-mt-2 pl-2 text-3.5'>{statusMessage}</p>
				)}
			</Field>

			<div className='flex justify-end'>
				<DialogCancelButton />
			</div>
		</div>
	);
});

export default TwitchAuthPage;
