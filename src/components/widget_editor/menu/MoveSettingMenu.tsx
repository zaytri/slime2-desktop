import useWidgetSettingsEditor from '@/contexts/widget_settings_editor/useWidgetSettingsEditor';
import { useWidgetSettingsEditorDispatch } from '@/contexts/widget_settings_editor/useWidgetSettingsEditorDispatch';
import type { WidgetSetting } from '@@/json/widgetSettings';
import {
	Menu,
	MenuButton,
	MenuButtonArrow,
	MenuGroup,
	MenuItem,
	MenuProvider,
} from '@ariakit/react';
import clsx from 'clsx';

type MoveSettingMenuProps = {
	id: string;
	categoryId: string;
	sectionId?: string;
};

export default function MoveSettingMenu({
	id,
	categoryId,
	sectionId,
}: MoveSettingMenuProps) {
	const { getSetting, groupOptions, categoryOptions } =
		useWidgetSettingsEditor();
	const { moveToGroup } = useWidgetSettingsEditorDispatch();

	const setting = getSetting(id, categoryId, sectionId);
	if (!setting) return null;

	// get options, disabling the group that this setting is in
	const options: Option<{
		id: string;
		type: WidgetSetting.AnySection['type'] | 'category';
	}>[] =
		'settings' in setting
			? categoryOptions.map(option => {
					const optionId = option.value;
					return {
						label: option.label,
						value: { id: optionId, type: 'category' },
						disabled: categoryId === optionId || sectionId === optionId,
					};
				})
			: groupOptions.map(option => {
					const optionId = option.value.id;
					return {
						...option,
						disabled: sectionId
							? sectionId === optionId
							: categoryId === optionId,
					};
				});

	const onMove = (newGroupId: string) => {
		if ('settings' in setting && sectionId) {
			throw new Error('Attempted to move section into another section!');
		}

		moveToGroup(id, setting, sectionId || categoryId, newGroupId);
	};

	return (
		<MenuProvider placement='left-start'>
			<MenuItem
				disabled={
					options.length === 0 ||
					options.every(option => {
						return option.disabled;
					})
				}
				render={<MenuButton />}
				className='dark-menu-item'
			>
				<MenuButtonArrow />
				<p>Move To</p>
			</MenuItem>

			<Menu modal unmountOnHide fitViewport className='dark-menu p-0!'>
				<MenuGroup className='flex flex-col overflow-y-auto p-1.5'>
					{options.map(option => {
						const isSection = option.value.type !== 'category';

						return (
							<MenuItem
								key={option.label}
								disabled={option.disabled}
								className={clsx('dark-menu-item py-0.5!', isSection && 'pl-3')}
								onClick={() => {
									onMove(option.value.id);
								}}
							>
								{isSection && (
									<div className='size-1.5 rounded-full bg-current'></div>
								)}
								{option.label}
							</MenuItem>
						);
					})}
				</MenuGroup>
			</Menu>
		</MenuProvider>
	);
}
