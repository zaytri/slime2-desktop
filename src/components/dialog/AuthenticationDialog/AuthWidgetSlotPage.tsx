import { usePage } from '@/contexts/pages/usePage';
import { usePageContext } from '@/contexts/pages/usePageContext';
import type { AuthenticationContext, AuthenticationPages } from '.';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';

export default function AuthWidgetSlotPage() {
	const { setPage } = usePage<AuthenticationPages>();
	const { service, type } = usePageContext<AuthenticationContext>();

	return (
		<div className='flex flex-1 flex-col justify-between gap-6'>
			<div className='flex flex-col text-4.5'>
				<p>
					No{' '}
					<strong className='capitalize'>
						{service} {type}
					</strong>{' '}
					accounts found.
				</p>
				<p>Would you like to connect a new one?</p>
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					onClick={() => {
						setPage(service);
					}}
				>
					New Account
				</DialogConfirmButton>
			</div>
		</div>
	);
}
