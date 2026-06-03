import { usePage } from '@/contexts/pages/usePage';
import { usePageContext } from '@/contexts/pages/usePageContext';
import BookSvg from '@@/svg/BookSvg';
import ChatBubbleSvg from '@@/svg/ChatBubbleSvg';
import type { AuthenticationContext, AuthenticationPages } from '.';
import DialogCancelButton from '../DialogButton/DialogCancelButton';

export default function AuthTypePage() {
	const { setPage } = usePage<AuthenticationPages>();
	const { setType } = usePageContext<AuthenticationContext>();

	return (
		<div className='flex flex-1 flex-col justify-between gap-6'>
			<div className='flex flex-col gap-4'>
				<AuthTypeButton
					description='Reads event data from this account such as follows, subscriptions, chat messages, etc.'
					onClick={() => {
						setType('read');
						setPage('service');
					}}
				>
					<BookSvg className='h-4.5' />
					<p>Read Account</p>
				</AuthTypeButton>
				<AuthTypeButton
					description='Can send chat messages from this account.'
					onClick={() => {
						setType('bot');
						setPage('service');
					}}
				>
					<ChatBubbleSvg className='h-4.5' />
					<p>Bot Account</p>
				</AuthTypeButton>
			</div>

			<div className='flex justify-end'>
				<DialogCancelButton />
			</div>
		</div>
	);
}

type AuthTypeButtonProps = {
	onClick: VoidFunction;
	description: string;
};

function AuthTypeButton({
	onClick,
	children,
	description,
}: Props.WithChildren<AuthTypeButtonProps>) {
	return (
		<button
			type='button'
			onClick={onClick}
			className='rounded-2 bg-white px-4 py-2 text-left text-zinc-600 outline-2 -outline-offset-1 outline-zinc-300 over:bg-lime-200 over:text-green-900 over:outline-4 over:outline-lime-600'
		>
			<div className='flex flex-col gap-1 overflow-hidden rounded-2 outline-offset-4 outline-lime-600 focus-visible:outline-4'>
				<div className='relative flex items-center gap-2.5 font-fredoka text-5 font-medium'>
					{children}
				</div>
				<div className='text-3.5 font-semibold'>{description}</div>
			</div>
		</button>
	);
}
