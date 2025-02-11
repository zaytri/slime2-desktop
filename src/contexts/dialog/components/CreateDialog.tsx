import CreateSvg from '@/components/svg/CreateSvg';
import { type CreatePayload, useDialog } from '@/contexts/dialog/useDialog';
import { useTileGridDispatch } from '@/contexts/tile_grid/useTileGrid';
import { createWidgetFolder, installDefaultWidget } from '@/helpers/commands';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { memo } from 'react';
import DialogHeader from './DialogHeader';

export default memo(function CreateDialog() {
	const { payload, close } = useDialog<CreatePayload>();
	const { addItem } = useTileGridDispatch();
	const navigate = useNavigate();

	return (
		<div>
			<DialogHeader>Create New...</DialogHeader>
			<div className='flex flex-col gap-8 p-14'>
				<div className='flex items-center justify-center gap-24'>
					<CreateButton
						className='rounded-slime'
						onClick={async () => {
							const id = await installDefaultWidget('test');
							addItem({ id, index: payload.index, folderId: payload.folderId });
							close();
						}}
					>
						Widget
					</CreateButton>
					{payload.folderId === 'main' && (
						<CreateButton
							className='rounded-10%'
							onClick={async () => {
								const id = await createWidgetFolder();
								addItem({
									id,
									index: payload.index,
									folderId: payload.folderId,
								});
								close();
								navigate({
									to: '/folder/$folderId',
									params: { folderId: id },
								});
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

type CreateButtonProps = {
	onClick: () => void;
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
			className='group flex flex-col items-center gap-2 transition-transform ease-bounce over:scale-125 first:over:-rotate-3 last:over:rotate-3 peer-over:scale-75 peer-over:opacity-50'
		>
			<div
				className={clsx(
					'relative flex h-32 w-36 items-center justify-center overflow-hidden border-4 border-green-800 bg-gradient-to-b from-lime-400 to-lime-200 shadow-[inset_0_0_20px] shadow-white/50',
					className,
				)}
			>
				<div className='relative size-12 text-emerald-800 transition-transform group-over:-rotate-180 group-over:scale-125'>
					<CreateSvg />
				</div>
			</div>
			<p className='text-lg font-medium text-neutral-700'>{children}</p>
		</button>
	);
});
