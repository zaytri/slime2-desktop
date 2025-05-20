import DialogHeader from '@/components/dialog/DialogHeader';
import PlusSvg from '@/components/svg/PlusSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useTileLocationsDispatch } from '@/contexts/tile_locations/useTileLocationsDispatch';
import { createWidgetFolder, installDefaultWidget } from '@/helpers/commands';
import clsx from 'clsx';
import { memo } from 'react';

type CreateTileDialogProps = {
	folderId: string;
	index: number;
};

const CreateTileDialog = memo(function CreateTileDialog({
	folderId,
	index,
}: CreateTileDialogProps) {
	const { closeDialog } = useDialog();
	const { addTile } = useTileLocationsDispatch();

	return (
		<div>
			<DialogHeader>Create New...</DialogHeader>
			<div className='flex flex-col gap-8 p-14'>
				<div className='flex items-center justify-center gap-24'>
					<CreateButton
						className='rounded-slime'
						onClick={async () => {
							const id = await installDefaultWidget('test');
							addTile({ id, index, folderId });
							closeDialog();
						}}
					>
						Widget
					</CreateButton>

					{folderId === 'main' && (
						<CreateButton
							className='rounded-10%'
							onClick={async () => {
								const id = await createWidgetFolder();
								addTile({
									id,
									index,
									folderId,
								});
								closeDialog();
							}}
						>
							Folder
						</CreateButton>
					)}
				</div>
			</div>
		</div>
	);
});

export default CreateTileDialog;

type CreateButtonProps = {
	onClick: VoidFunction;
};

const CreateButton = memo(function CreateButton({
	onClick,
	className,
	children,
}: Props.WithClassNameAndChildren<CreateButtonProps>) {
	return (
		<button
			type='button'
			onClick={onClick}
			className='group ease-bounce over:scale-125 first:over:-rotate-3 last:over:rotate-3 peer-over:scale-75 peer-over:opacity-50 flex flex-col items-center gap-2 transition-transform'
		>
			<div
				className={clsx(
					'relative flex h-32 w-36 items-center justify-center overflow-hidden border-4 border-green-800 bg-linear-to-b from-lime-400 to-lime-200 shadow-[inset_0_0_20px] shadow-white/50',
					className,
				)}
			>
				<div className='group-over:-rotate-180 group-over:scale-125 relative size-12 text-emerald-800 transition-transform'>
					<PlusSvg />
				</div>
			</div>
			<p className='text-lg font-medium text-neutral-700'>{children}</p>
		</button>
	);
});
