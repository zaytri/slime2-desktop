import { useDialog } from '@/contexts/dialog/useDialog';
import useWidgetSettingsEditor from '@/contexts/widget_settings_editor/useWidgetSettingsEditor';
import { useWidgetSettingsEditorDispatch } from '@/contexts/widget_settings_editor/useWidgetSettingsEditorDispatch';
import EditWidgetSectionDialog from '@@/dialog/edit_widget_setting/EditWidgetSectionDialog';
import EditWidgetSettingDialog from '@@/dialog/edit_widget_setting/EditWidgetSettingDialog';
import {
	CATEGORY_SETTING_GROUPED_OPTIONS,
	SECTION_SETTING_GROUPED_OPTIONS,
	SETTINGS_DATA,
	type WidgetSetting,
} from '@@/json/widgetSettings';
import {
	Menu,
	MenuButton,
	MenuButtonArrow,
	MenuGroup,
	MenuGroupLabel,
	MenuItem,
	MenuProvider,
} from '@ariakit/react';

type AddSettingMenuProps = {
	categoryId: string;
	sectionId?: string;
};

export default function AddSettingMenu({
	categoryId,
	sectionId,
}: AddSettingMenuProps) {
	const { openDialog } = useDialog();
	const { idExists } = useWidgetSettingsEditor();
	const { addSetting } = useWidgetSettingsEditorDispatch();
	const options = sectionId
		? SECTION_SETTING_GROUPED_OPTIONS
		: CATEGORY_SETTING_GROUPED_OPTIONS;

	function onAdd(type: WidgetSetting.NonCategory['type']) {
		if (type === 'section' || type === 'multi-section') {
			if (sectionId) {
				throw new Error('Attempted to add section into another section!');
			}

			openDialog(
				'New Group',
				<EditWidgetSectionDialog
					type={type}
					idExists={idExists}
					onSave={(newId, newLabel, newType, newCondition, newSearchTags) => {
						addSetting(
							newId,
							{
								...SETTINGS_DATA[newType].defaultData,
								label: newLabel,
								condition: newCondition,
								searchTags: newSearchTags,
							},
							categoryId,
						);
					}}
				/>,
			);
		} else {
			openDialog(
				'New Setting',
				<EditWidgetSettingDialog
					idExists={idExists}
					data={SETTINGS_DATA[type].defaultData}
					onSave={(newId, newLabel, newData) => {
						addSetting(
							newId,
							{ ...newData, label: newLabel },
							categoryId,
							sectionId,
						);
					}}
				/>,
			);
		}
	}

	return (
		<MenuProvider placement='left-start'>
			<MenuItem render={<MenuButton />} className='dark-menu-item'>
				<MenuButtonArrow />
				<p>Add</p>
			</MenuItem>
			<Menu modal unmountOnHide fitViewport className='dark-menu p-0!'>
				<div className='flex flex-col gap-1 divide-y divide-zinc-600 overflow-y-auto px-2 py-1.5'>
					{options.map(group => {
						return (
							<MenuGroup key={group.label} className='flex flex-col'>
								<MenuGroupLabel className='dark-menu-group-label'>
									{group.label}
								</MenuGroupLabel>
								{group.options.map(option => {
									return (
										<MenuItem
											key={option.label}
											className='dark-menu-item px-4! py-0.5!'
											onClick={() => {
												onAdd(option.value);
											}}
										>
											{option.label}
										</MenuItem>
									);
								})}
							</MenuGroup>
						);
					})}
				</div>
			</Menu>
		</MenuProvider>
	);
}
