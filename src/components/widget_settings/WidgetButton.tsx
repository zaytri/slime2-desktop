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
			className='relative my-2 flex w-full items-center justify-center overflow-hidden rounded-2 border border-lime-300 bg-lime-300 bg-linear-to-b from-lime-400 to-lime-500 px-4 py-1 font-fredoka text-5.5 font-medium text-green-900 outline-2 outline-offset-0! outline-lime-600 over:bg-lime-300 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
			onClick={() => {
				sendWidgetButtonClick(widgetId, id);
			}}
		>
			<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
			<div className='relative flex items-center justify-center gap-3 drop-shadow-[0_1px_3px_#FFFB]'>
				<PaperAirplaneSvg className='size-4.5' />
				<p>{label}</p>
			</div>
		</button>
	);
}
