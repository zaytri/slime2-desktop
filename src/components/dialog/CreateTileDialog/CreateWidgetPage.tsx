import { useDialog } from '@/contexts/dialog/useDialog';
import { usePage } from '@/contexts/pages/usePage';
import { usePageContext } from '@/contexts/pages/usePageContext';
import {
	groupDefaultWidgets,
	type DefaultWidget,
	type DefaultWidgetId,
} from '@/helpers/defaultWidgets';
import ArrowDownTraySvg from '@@/svg/ArrowDownTraySvg';
import type { CreateTileContext, CreateTilePages } from '.';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';

const { overlayWidgets, botWidgets } = groupDefaultWidgets();

export default function CreateWidgetPage() {
	const { setPage } = usePage<CreateTilePages>();

	return (
		<div className='flex w-200 flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<h2 className='font-mochiy text-6 text-zinc-800 text-shadow-[0_1px_white]'>
					Slime2 Widgets
				</h2>

				<DialogConfirmButton
					icon={<ArrowDownTraySvg className='size-4.5' />}
					onClick={() => {
						setPage('custom');
					}}
				>
					Import Custom Widget
				</DialogConfirmButton>
			</div>

			<DefaultWidgetList
				title='Overlays'
				widgets={overlayWidgets}
				description='Dynamically display stream events such as chat messages, follows, subscriptions, etc.'
			/>
			<DefaultWidgetList
				title='Bots'
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
		<section className='input-wrapper flex flex-col gap-3 p-3 pt-2'>
			<div className='flex items-baseline justify-between gap-4'>
				<h3 className='font-fredoka text-5.5 font-medium'>{title}</h3>
				<em className='text-3.5 text-zinc-600'>{description}</em>
			</div>

			<div className='grid grid-cols-2 gap-4 rounded-2'>
				{[...widgets.entries()].map(([widgetId, widget]) => {
					return (
						<button
							key={widgetId}
							type='button'
							className='group/button flex flex-1 items-center gap-3 rounded-2 border border-white bg-zinc-100 px-2 py-1 text-zinc-800 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:text-emerald-900 over:outline-4 over:outline-lime-600'
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
								<p className='text-3.5 font-medium text-zinc-700'>
									{widget.description}
								</p>
							</div>
						</button>
					);
				})}
			</div>
		</section>
	);
}
