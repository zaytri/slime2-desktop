import { useDialog } from '@/contexts/dialog/useDialog';
import PageContextProvider from '@/contexts/pages/PageContextProvider';
import PageProvider from '@/contexts/pages/PageProvider';
import { usePage } from '@/contexts/pages/usePage';
import type { Account } from '@/helpers/json/accounts';
import { capitalizeWord } from '@/helpers/string';
import { useEffect, useState } from 'react';
import DialogContent from '../DialogContent';
import AuthServicePage from './AuthServicePage';
import AuthSuccessPage from './AuthSuccessPage';
import AuthTypePage from './AuthTypePage';
import AuthWidgetSlotPage from './AuthWidgetSlotPage';
import ReauthPage from './ReauthPage';
import TwitchAuthPage from './TwitchAuthPage';

type AuthenticationDialogProps = {
	reauth?: Account;
	slot?: {
		type: Account['type'];
		service: Account['service'];
	};
};

export type AuthenticationPages =
	| 'type'
	| 'service'
	| 'twitch'
	| 'youtube'
	| 'success'
	| 'reauth'
	| 'slot';

export type AuthenticationContext = {
	service: Account['service'];
	setService: (service: Account['service']) => void;
	type: Account['type'];
	setType: (type: Account['type']) => void;
	accountId: string;
	setAccountId: (accountId: string) => void;
};

export default function AuthenticationDialog({
	reauth,
	slot,
}: AuthenticationDialogProps) {
	const [type, setType] = useState<Account['type']>(
		reauth?.type || slot?.type || 'read',
	);
	const [service, setService] = useState<Account['service']>(
		reauth?.service || slot?.service || 'twitch',
	);
	const [page, setPage] = useState<AuthenticationPages>(
		reauth ? 'reauth' : slot ? 'slot' : 'type',
	);
	const [accountId, setAccountId] = useState<string>(reauth ? reauth.id : '');

	const { setTitle, setOnBack } = useDialog();

	useEffect(() => {
		switch (page) {
			case 'service':
				setTitle(`${capitalizeWord(type)} Account Connection`);
				setOnBack(() => {
					setPage('type');
				});
				break;
			case 'twitch':
				setTitle(`Connect Twitch ${capitalizeWord(type)}`);
				setOnBack(
					reauth || slot
						? undefined
						: () => {
								setPage('service');
							},
				);
				break;
			case 'youtube':
				setTitle(`Connect YouTube ${capitalizeWord(type)}`);
				setOnBack(
					reauth || slot
						? undefined
						: () => {
								setPage('service');
							},
				);
				break;
			case 'success':
				setTitle('Account Connected!');
				setOnBack(undefined);
				break;
			case 'reauth':
				setTitle('Account Connection Expired!');
				setOnBack(undefined);
				break;
			case 'slot':
				setTitle('No Accounts Found');
				setOnBack(undefined);
				break;
			case 'type':
			default:
				setTitle('Choose Account Type');
				setOnBack(undefined);
				break;
		}
	}, [page, type]);

	return (
		<DialogContent className='flex max-w-96 p-4'>
			<PageContextProvider<AuthenticationContext>
				service={service}
				setService={setService}
				type={type}
				setType={setType}
				accountId={accountId}
				setAccountId={setAccountId}
			>
				<PageProvider page={page} setPage={setPage}>
					<AuthenticationPage />
				</PageProvider>
			</PageContextProvider>
		</DialogContent>
	);
}

function AuthenticationPage() {
	const { page } = usePage<AuthenticationPages>();

	switch (page) {
		case 'type':
			return <AuthTypePage />;
		case 'reauth':
			return <ReauthPage />;
		case 'twitch':
			return <TwitchAuthPage />;
		case 'success':
			return <AuthSuccessPage />;
		case 'service':
			return <AuthServicePage />;
		case 'slot':
			return <AuthWidgetSlotPage />;
		case 'youtube':
		default:
			return <p>missing!</p>;
	}
}
