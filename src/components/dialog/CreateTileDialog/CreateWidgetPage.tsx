import { useDialog } from '@/contexts/dialog/useDialog';
import { usePageContext } from '@/contexts/pages/usePageContext';
import {
	groupDefaultWidgets,
	type DefaultWidget,
	type DefaultWidgetId,
} from '@/helpers/defaultWidgets';
import { CreateTileContext } from '.';

const { overlayWidgets, botWidgets } = groupDefaultWidgets();

export default function CreateWidgetPage() {
	return (
		<div className='relative flex w-200 flex-col gap-4'>
			<div className='absolute top-4 right-6'></div>

			<DefaultWidgetList
				title='Overlay Widgets'
				widgets={overlayWidgets}
				description='Dynamically display stream events such as chat messages, follows, subscriptions, etc.'
			/>
			<DefaultWidgetList
				title='Bot Widgets'
				widgets={botWidgets}
				description='Automated interactions such as chat bot messages'
			/>
		</div>
	);
}

type DefaultWidgetListProps = {
	title: string;
	widgets: Map<DefaultWidgetId, DefaultWidget>;
	description: string;
};

function DefaultWidgetList({
	title,
	widgets,
	description,
}: DefaultWidgetListProps) {
	const { onCreateDefaultWidget } = usePageContext<CreateTileContext>();
	const { closeDialog } = useDialog();

	if (widgets.size === 0) return null;

	return (
		<section className='flex flex-col gap-2'>
			<div className='flex items-end justify-between gap-4 text-shadow-[0_1px_white]'>
				<h2 className='font-fredoka text-5.5 font-medium'>{title}</h2>
				<em className='text-3.5 text-zinc-600'>{description}</em>
			</div>

			<div className='input-wrapper grid grid-cols-2 gap-4 rounded-2 p-3'>
				{[...widgets.entries()].map(([widgetId, widget]) => {
					return (
						<button
							type='button'
							className='group/button flex flex-1 items-center gap-3 rounded-2 border border-white bg-lime-100 px-2 py-1 text-green-900 outline-2 outline-offset-0! outline-lime-600 over:bg-lime-200 over:outline-4 over:outline-lime-600'
							onClick={() => {
								onCreateDefaultWidget(widgetId);
								closeDialog();
							}}
						>
							<img src={widget.icon} className='size-14 object-contain' />
							<div className='flex flex-col text-left'>
								<p className='text-4.5 font-bold group-over/button:underline'>
									{widget.name}
								</p>
								<p className='text-3.5 font-medium'>{widget.description}</p>
							</div>
						</button>
					);
				})}
			</div>
		</section>
	);
}
