import ArrowLeftSvg from '@@/svg/ArrowLeftSvg';

type HeaderBackButtonProps = {
	onClick: VoidFunction;
};

export default function HeaderBackButton({ onClick }: HeaderBackButtonProps) {
	return (
		<button
			type='button'
			autoFocus
			onClick={onClick}
			className='group/back rounded-1 p-2 text-white outline-offset-0! over:text-green-200 over:outline-4 over:outline-green-400'
		>
			<p className='sr-only'>Back</p>
			<ArrowLeftSvg className='size-7 drop-shadow-[0_2px_black] group-over/back:drop-shadow-none' />
		</button>
	);
}
