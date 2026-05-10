import useWidgetSettingsEditor from '@/contexts/widget_settings_editor/useWidgetSettingsEditor';
import { useWidgetSettingsEditorDispatch } from '@/contexts/widget_settings_editor/useWidgetSettingsEditorDispatch';
import { type WidgetSetting } from '@@/json/widgetSettings';
import GearSvg from '@@/svg/GearSvg';
import { Menu, MenuButton, MenuProvider } from '@ariakit/react';
import clsx from 'clsx';
import AddSettingMenu from './AddSettingMenu';
import DeleteSettingMenuItem from './DeleteSettingMenuItem';
import DemoteCategoryMenu from './DemoteCategoryMenu';
import EditSettingMenuItem from './EditSettingMenuItem';
import MoveSettingMenu from './MoveSettingMenu';
import PromoteSectionMenuItem from './PromoteSectionMenuItem';
import SwapSettingIndexMenuItems from './SwapSettingIndexMenuItems';

type SettingEditorMenuProps = {
	id: string;
	index: number;
} & (
	| {
			type: 'category';
			categoryId?: never;
			sectionId?: never;
	  }
	| {
			type: WidgetSetting.NonCategory['type'];
			categoryId: string;
			sectionId?: string;
	  }
);

export default function SettingEditorMenu({
	id,
	index,
	type,
	categoryId,
	sectionId,
}: SettingEditorMenuProps) {
	const {} = useWidgetSettingsEditor();
	const {} = useWidgetSettingsEditorDispatch();

	let colorsClassName = clsx(
		'text-green-800 over:border-green-900 over:bg-green-800',
	);

	switch (type) {
		case 'category':
			colorsClassName = clsx(
				'text-yellow-800 over:border-yellow-900 over:bg-yellow-800',
			);
			break;
		case 'section':
			colorsClassName = clsx(
				'text-cyan-800 over:border-cyan-900 over:bg-cyan-800',
			);
			break;
		case 'multi-section':
			colorsClassName = clsx(
				'text-blue-900 over:border-blue-950 over:bg-blue-900',
			);
			break;
	}

	return (
		<MenuProvider>
			<MenuButton
				className={clsx(
					'flex rounded-1 border-2 border-transparent p-1 aria-expanded:border-zinc-800 aria-expanded:bg-zinc-700 aria-expanded:text-white over:text-white',
					colorsClassName,
				)}
			>
				<GearSvg className='size-5.25' />
			</MenuButton>

			<Menu unmountOnHide modal className='dark-menu'>
				{/* Edit */}
				<EditSettingMenuItem
					id={id}
					index={index}
					type={type}
					categoryId={categoryId}
					sectionId={sectionId}
				/>

				{/* Move Up and Down */}
				<SwapSettingIndexMenuItems
					index={index}
					categoryId={categoryId}
					sectionId={sectionId}
				/>

				{/* Add */}
				{(type === 'category' ||
					type === 'section' ||
					type === 'multi-section') && (
					<AddSettingMenu
						categoryId={type === 'category' ? id : categoryId}
						sectionId={type === 'category' ? undefined : id}
					/>
				)}

				{/* Move To */}
				{type !== 'category' && (
					<MoveSettingMenu
						id={id}
						categoryId={categoryId}
						sectionId={sectionId}
					/>
				)}

				{/* Promote Section to Category */}
				{(type === 'section' || type === 'multi-section') && (
					<PromoteSectionMenuItem id={id} categoryId={categoryId} />
				)}

				{/* Demote Category to Section */}
				{type === 'category' && <DemoteCategoryMenu id={id} />}

				{/* Delete */}
				<DeleteSettingMenuItem
					id={id}
					categoryId={categoryId}
					sectionId={sectionId}
				/>
			</Menu>
		</MenuProvider>
	);
}
