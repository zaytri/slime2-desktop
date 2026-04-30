import XSvg from '@/components/svg/XSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import ArrowLeftSvg from '../svg/ArrowLeftSvg';

export default function Dialog({ children }: Props.WithChildren) {
	const { closeDialog: close, onCancel, title, onBack } = useDialog();

	if (children === null) return null;

	return (
		<div className='absolute inset-0 flex items-center justify-center'>
			<div className='animate-bounce-in rounded-3'>
				<div className='flex min-h-48 min-w-96 flex-col'>
					{/* title bar */}
					<div className='relative flex overflow-hidden rounded-t-3 bg-linear-to-b from-zinc-700 to-zinc-800 py-0.5'>
						<div className='absolute inset-0 bottom-1/2 bg-white opacity-5'></div>
						<div className='relative flex flex-1 items-center px-2 py-1'>
							{/* back button */}
							{onBack && (
								<button
									type='button'
									className='flex items-center rounded-lg p-2 text-white over:text-green-200 over:outline-4 over:-outline-offset-3! over:outline-green-400'
									onClick={onBack}
								>
									<span className='sr-only'>Back</span>
									<ArrowLeftSvg className='-mt-0.5 size-4.5 drop-shadow-[0_2px_#0008]' />
								</button>
							)}

							{/* title */}
							<h2 className='flex-1 pl-2 text-5 font-bold text-white text-shadow-[0_2px_#0008]'>
								{title}
							</h2>

							{/* close button */}
							<button
								type='button'
								className='flex items-center rounded-lg p-2 text-white over:text-rose-200 over:outline-4 over:-outline-offset-3! over:outline-rose-400'
								onClick={onCancel ?? close}
							>
								<span className='sr-only'>Close</span>
								<XSvg className='-mt-0.5 size-4 drop-shadow-[0_2px_#0008]' />
							</button>
						</div>
					</div>

					{/* contents */}
					{children}
				</div>
			</div>
		</div>
	);
}
