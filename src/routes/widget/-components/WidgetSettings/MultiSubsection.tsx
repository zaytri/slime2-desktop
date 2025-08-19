import RenameDialog from '@/components/dialog/RenameDialog';
import DoubleSquareSvg from '@/components/svg/DoubleSquareSvg';
import GearSvg from '@/components/svg/GearSvg';
import PencilSvg from '@/components/svg/PencilSvg';
import TrashSvg from '@/components/svg/TrashSvg';
import TriangleDownSvg from '@/components/svg/TriangleDownSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
	MenuSection,
	MenuSeparator,
} from '@headlessui/react';
import { memo } from 'react';
import { z } from 'zod/mini';

type MultiSectionProps = {
	onDelete: VoidFunction;
	onDuplicate: (value: string) => void;
};

const MultiSubsection = memo(function MultiSubsection({
	id,
	children,
	onDelete,
	onDuplicate,
}: Props.WithId<Props.WithChildren<MultiSectionProps>>) {
	const { widgetValue, setWidgetValue } = useWidgetValue(id);
	const { openDialog } = useDialog();

	const value = z.catch(z.string(), 'New').parse(widgetValue);

	return (
		<Disclosure
			as='section'
			className='rounded-2 flex flex-col border border-stone-300 bg-white'
		>
			<div className='rounded-2 flex items-center gap-2 px-4 py-2 has-data-focus:outline-2'>
				<DisclosureButton className='group/sub flex flex-1 items-center gap-2 outline-none'>
					<h4 className='text-4.5 flex-1 text-left font-medium'>{value}</h4>

					<div className='rounded-1 flex items-center justify-center p-1 group-data-open/sub:rotate-180 group-data-over/sub:bg-black group-data-over/sub:text-white group-data-over/sub:outline-2'>
						<TriangleDownSvg className='size-4 pt-1' />
					</div>
				</DisclosureButton>

				<Menu>
					<MenuButton className='rounded-1 flex items-center justify-center p-1 outline-none data-over:bg-black data-over:text-white'>
						<GearSvg className='size-6' />
					</MenuButton>
					<MenuItems
						anchor={{
							to: 'bottom end',
							padding: 32,
							gap: 6,
							offset: 8,
						}}
						className='rounded-2 text-3.5 flex w-32 flex-col border border-stone-300 bg-white p-2 shadow data-focus:outline-2'
					>
						<MenuSection className='flex flex-col'>
							<MenuItem
								as='button'
								className='mini-menu-item'
								onClick={() => {
									openDialog(
										<RenameDialog value={value} onSave={setWidgetValue} />,
									);
								}}
							>
								<PencilSvg className='size-3.5' />
								Rename
							</MenuItem>
							<MenuItem
								as='button'
								className='mini-menu-item'
								onClick={() => {
									onDuplicate(value);
								}}
							>
								<DoubleSquareSvg className='size-3.5' />
								Duplicate
							</MenuItem>
						</MenuSection>
						<MenuSeparator className='my-1 h-px bg-stone-300' />
						<MenuSection className='flex flex-col'>
							<MenuItem
								as='button'
								className='mini-menu-item text-rose-700 outline-rose-950 data-over:bg-rose-800 data-over:text-white'
								onClick={onDelete}
							>
								<TrashSvg className='-mt-1 size-3.5' />
								<p>Delete</p>
							</MenuItem>
						</MenuSection>
					</MenuItems>
				</Menu>
			</div>

			<DisclosurePanel className='flex flex-col gap-4 border-t border-stone-300 p-4 inset-shadow-sm'>
				{children}
			</DisclosurePanel>
		</Disclosure>
	);
});

export default MultiSubsection;
