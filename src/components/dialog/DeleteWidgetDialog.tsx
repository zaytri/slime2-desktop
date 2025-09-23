import { useDialog } from '@/contexts/dialog/useDialog';
import { useTileLocationsDispatch } from '@/contexts/tile_locations/useTileLocationsDispatch';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { deleteWidget } from '@/helpers/commands';
import { memo } from 'react';
import DialogHeader from './DialogHeader';

type DeleteWidgetDialogProps = {
	id: string;
};

const DeleteWidgetDialog = memo(function DeleteWidgetDialog({
	id,
}: DeleteWidgetDialogProps) {
	const { closeDialog: closeDialog, onCancel } = useDialog();
	const { tileMeta } = useTileMeta(id);
	const { removeTile } = useTileLocationsDispatch();

	return (
		<div className='max-w-96'>
			<DialogHeader>Widget Deletion</DialogHeader>
			<div className='flex flex-col gap-8'>
				<p className='text-lg'>
					Are you sure you want to delete the <br />
					<strong>{tileMeta.name}</strong> widget?
				</p>

				<div className='flex gap-2'>
					<button
						type='button'
						className='rounded-2 over:translate-y-0.5 over:bg-none over:shadow-none flex-1 border-2 border-emerald-800 bg-lime-400 bg-linear-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800'
						onClick={onCancel}
					>
						Cancel
					</button>

					<button
						type='button'
						className='group over:translate-y-0.5 over:bg-none over:shadow-none flex-1 rounded-lg border-2 border-rose-800 bg-rose-300 bg-linear-to-b from-rose-300 from-50% to-rose-400 to-50% py-2 text-xl font-medium text-rose-900 shadow-[0_2px] shadow-rose-800 transition-[gap]'
						onClick={async () => {
							closeDialog();
							await deleteWidget(id);
							removeTile(id);
							dispatchEvent(
								new CustomEvent('widget-delete', {
									detail: { widgetId: id },
								}),
							);
						}}
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
});

export default DeleteWidgetDialog;
