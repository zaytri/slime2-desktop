import { useDialog } from '@/contexts/dialog/useDialog';
import MediaSelectDialog from '@@/dialog/MediaSelectDialog';
import MediaIcon from '../MediaIcon';

type MediaSelectButtonProps = {
	type: 'audio' | 'video' | 'image';
	onSave: (value: string) => void;
};

export default function MediaSelectButton({
	type,
	onSave,
	children,
}: Props.WithChildren<MediaSelectButtonProps>) {
	const { openDialog } = useDialog();

	return (
		<button
			type='button'
			className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-1.5 font-fredoka text-4.5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
			onClick={() => {
				openDialog(
					`File Select`,
					<MediaSelectDialog type={type} onSave={onSave} />,
				);
			}}
		>
			<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
			<div className='relative flex flex-1 items-center justify-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
				<MediaIcon type={type} className='h-5' />
				<div>{children}</div>
			</div>
		</button>
	);
}
