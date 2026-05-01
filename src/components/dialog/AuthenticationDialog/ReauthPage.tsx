import AccountPreview from '@/components/AccountPreview';
import { useAccount } from '@/contexts/accounts/useAccount';
import { usePage } from '@/contexts/pages/usePage';
import { usePageContext } from '@/contexts/pages/usePageContext';
import { AuthenticationContext, AuthenticationPages } from '.';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';

export default function ReauthPage() {
	const { service, accountId } = usePageContext<AuthenticationContext>();
	const { account } = useAccount(accountId);
	const { setPage } = usePage<AuthenticationPages>();

	return (
		<div className='flex flex-1 flex-col justify-between gap-6'>
			<div className='flex flex-col gap-2'>
				<AccountPreview account={account} />
				<p>Would you like to reconnect this account?</p>
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					onClick={() => {
						setPage(service);
					}}
				>
					Reconnect
				</DialogConfirmButton>
			</div>
		</div>
	);
}
