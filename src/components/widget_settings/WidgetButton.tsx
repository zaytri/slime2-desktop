import { useWidgetId } from '@/contexts/widget_id/useWidgetId';
import { sendWidgetButtonClick } from '@/helpers/widgetMessage';
import PaperAirplaneSvg from '../svg/PaperAirplaneSvg';

type WidgetButtonProps = {
	id: string;
	label: string;
};

export default function WidgetButton({ id, label }: WidgetButtonProps) {
	const widgetId = useWidgetId();

	return (
		<button
			type='button'
			className='relative flex self-start overflow-hidden rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-4 py-2 text-5 font-bold text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
			onClick={async () => {
				sendWidgetButtonClick(widgetId, id);
			}}
		>
			<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
			<div className='relative flex items-center justify-center gap-3 drop-shadow-[0_1px_3px_#FFFB]'>
				<PaperAirplaneSvg className='size-4.5' />
				<p className='-mb-0.5'>{label}</p>
			</div>
		</button>
	);
}
