import { useDialog } from '@/contexts/dialog/useDialog';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { useWidgetValuesDispatch } from '@/contexts/widget_values/useWidgetValuesDispatch';
import { widgetSettingsScrollContainerId } from '@/helpers/scroll';
import useAutoScrollDisclosureOpen from '@/hooks/useAutoScrollDisclosureOpen';
import {
	Tooltip,
	TooltipAnchor,
	TooltipArrow,
	TooltipProvider,
} from '@ariakit/react';
import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from '@headlessui/react';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { z } from 'zod/mini';
import GenericDeleteDialog from '../dialog/GenericDeleteDialog';
import TextField from '../input_fields/TextField';
import DoubleSquareSvg from '../svg/DoubleSquareSvg';
import PencilSvg from '../svg/PencilSvg';
import TrashSvg from '../svg/TrashSvg';
import TriangleDownSvg from '../svg/TriangleDownSvg';

type SettingMultiSubsectionProps = {
	id: string;
	onDelete: VoidFunction;
	onDuplicate: (sourceName: string) => void;
};

export default function SettingMultiSubsection({
	id,
	onDelete,
	onDuplicate,
	children,
}: Props.WithChildren<SettingMultiSubsectionProps>) {
	const { widgetValue } = useWidgetValue(id);
	const { setValue } = useWidgetValuesDispatch();
	const [renaming, setRenaming] = useState(false);
	const { openDialog } = useDialog();

	const disclosureButtonRef = useRef<HTMLButtonElement>(null);
	useAutoScrollDisclosureOpen(
		disclosureButtonRef,
		widgetSettingsScrollContainerId,
	);

	const value = z.catch(z.string(), 'New Item').parse(widgetValue);
	const [newName, setNewName] = useState(value);

	function renameSubsection() {
		setRenaming(false);
		setNewName('');

		const newSubsectionName = newName.trim();
		if (newSubsectionName) {
			setValue(id, newSubsectionName);
		}
	}

	return (
		<Disclosure as='section' className='flex flex-col'>
			<div className='flex items-center gap-2'>
				<DisclosureButton
					className='group/sub z-10 flex flex-1 items-center gap-2 rounded-2 border border-white bg-zinc-100 bg-linear-to-b from-zinc-100 to-zinc-200/50 px-4 py-2 outline-2 outline-offset-0! outline-zinc-400/50 data-open:rounded-b-0 data-open:bg-none over:bg-lime-200 over:bg-none over:text-green-900 over:outline-4 over:outline-lime-600'
					ref={disclosureButtonRef}
				>
					<h4 className='flex-1 text-left font-fredoka text-5 font-medium'>
						{value}
					</h4>

					<div className='flex items-center justify-center rounded-1 p-1 group-data-open/sub:rotate-180 group-data-over/sub:bg-lime-600 group-data-over/sub:text-lime-200 group-data-over/sub:outline-none'>
						<TriangleDownSvg className='size-4' />
					</div>
				</DisclosureButton>

				<div className='flex'>
					{renaming ? (
						<div className='flex items-center gap-4 px-2'>
							<TextField
								value={newName}
								onChange={setNewName}
								placeholder='Item Name'
								autoFocus
								onEnterKey={renameSubsection}
							/>
							<button
								type='button'
								className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-0.5 font-fredoka text-4.5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
								onClick={renameSubsection}
							>
								<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
								<div className='relative flex flex-1 items-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
									<PencilSvg className='size-4' />
									<p>Save</p>
								</div>
							</button>
						</div>
					) : (
						<SubsectionAction
							label='Rename'
							icon={<PencilSvg className='size-6' />}
							onClick={() => {
								setRenaming(true);
							}}
						/>
					)}

					<SubsectionAction
						label='Duplicate'
						icon={<DoubleSquareSvg className='size-6' />}
						onClick={() => {
							onDuplicate(value);
						}}
					/>

					<SubsectionAction
						label='Delete'
						icon={<TrashSvg className='-mr-0.5 size-6' />}
						onClick={() => {
							openDialog(
								'Delete Item',
								<GenericDeleteDialog onDelete={onDelete}>
									<p>
										Are you sure you want to <strong>permanently</strong> delete{' '}
										<strong>{value}</strong>?
									</p>
								</GenericDeleteDialog>,
							);
						}}
						dangerAction
					/>
				</div>
			</div>

			<DisclosurePanel className='mt-0.5 flex flex-col gap-2 rounded-2 rounded-tl-0 border border-white bg-zinc-200 bg-linear-to-b from-zinc-100 to-zinc-100/50 p-4 outline-2 outline-zinc-400/50'>
				{children}
			</DisclosurePanel>
		</Disclosure>
	);
}

type SubsectionActionProps = {
	icon: React.ReactNode;
	label: string;
	onClick: VoidFunction;
	dangerAction?: boolean;
};

function SubsectionAction({
	label,
	icon,
	onClick,
	dangerAction = false,
}: SubsectionActionProps) {
	return (
		<TooltipProvider>
			<TooltipAnchor
				render={
					<button
						type='button'
						className={clsx(
							'rounded-2 p-2 outline-none',
							dangerAction
								? 'text-rose-900 over:bg-rose-800 over:text-rose-100'
								: 'text-zinc-700 over:bg-lime-600 over:text-lime-100',
						)}
						onClick={onClick}
					/>
				}
			>
				{icon}
				<p className='sr-only'>{label} Item</p>
			</TooltipAnchor>
			<Tooltip
				gutter={2}
				className={clsx(
					'z-20 rounded-2 bg-linear-to-b px-2 py-1 text-4.5 font-semibold shadow-[0_2px_10px_#0004] outline-4 -outline-offset-2 select-none',
					dangerAction
						? 'bg-rose-100 text-rose-900 outline-rose-700'
						: 'bg-lime-100 text-lime-800 outline-lime-600',
				)}
				focusable={false}
			>
				{label}
				<TooltipArrow
					className={clsx(dangerAction ? '*:fill-rose-700' : '*:fill-lime-600')}
				/>
			</Tooltip>
		</TooltipProvider>
	);
}
