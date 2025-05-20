import { useDialog } from '@/contexts/dialog/useDialog';
import useTileFolder from '@/contexts/tile_locations/useTileFolder';
import { useTileLocationsDispatch } from '@/contexts/tile_locations/useTileLocationsDispatch';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { deleteWidgetFolder } from '@/helpers/commands';
import { useNavigate } from '@tanstack/react-router';
import { memo } from 'react';
import DialogHeader from './DialogHeader';

type DeleteFolderDialogProps = {
	id: string;
};

const DeleteFolderDialog = memo(function DeleteFolderDialog({
	id,
}: DeleteFolderDialogProps) {
	const { closeDialog, onCancel } = useDialog();
	const { tileMeta } = useTileMeta(id);
	const { removeTile } = useTileLocationsDispatch();
	const { status } = useTileFolder(id);
	const navigate = useNavigate();

	return (
		<div className='max-w-96'>
			<DialogHeader>
				{status.empty ? 'Folder Deletion' : "Can't delete folder!"}
			</DialogHeader>
			<div className='flex flex-col gap-8'>
				<p className='text-lg'>
					{status.empty ? (
						<>
							Are you sure you want to delete the
							<br />
							<strong>{tileMeta.name}</strong> folder?
						</>
					) : (
						<>
							Folder <strong>{tileMeta.name}</strong> is not empty. <br />
							Please empty the folder before deletion.
						</>
					)}
				</p>

				<div className='flex gap-2'>
					<button
						type='button'
						className='rounded-2 over:translate-y-0.5 over:bg-none over:shadow-none flex-1 border-2 border-emerald-800 bg-lime-400 bg-linear-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800'
						onClick={onCancel}
					>
						{status.empty ? 'Cancel' : 'Ok'}
					</button>

					{status.empty && (
						<button
							type='button'
							className='group over:translate-y-0.5 over:bg-none over:shadow-none flex-1 rounded-lg border-2 border-rose-800 bg-rose-300 bg-linear-to-b from-rose-300 from-50% to-rose-400 to-50% py-2 text-xl font-medium text-rose-900 shadow-[0_2px] shadow-rose-800 transition-[gap]'
							onClick={async () => {
								closeDialog();
								await navigate({ to: '/', replace: true });
								await deleteWidgetFolder(id);
								removeTile(id);
							}}
						>
							Delete
						</button>
					)}
				</div>
			</div>
		</div>
	);
});

export default DeleteFolderDialog;
