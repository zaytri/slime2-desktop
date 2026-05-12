import { useDialog } from '@/contexts/dialog/useDialog';
import useWidgetSettingsEditor from '@/contexts/widget_settings_editor/useWidgetSettingsEditor';
import { useWidgetSettingsEditorDispatch } from '@/contexts/widget_settings_editor/useWidgetSettingsEditorDispatch';
import { i18nStringTransform } from '@/helpers/i18n';
import EditWidgetCategoryDialog from '@@/dialog/edit_widget_setting/EditWidgetCategoryDialog.tsx';
import EditWidgetSectionDialog from '@@/dialog/edit_widget_setting/EditWidgetSectionDialog';
import EditWidgetSettingDialog from '@@/dialog/edit_widget_setting/EditWidgetSettingDialog';
import type { WidgetSetting } from '@@/json/widgetSettings';
import PencilSvg from '@@/svg/PencilSvg';
import { MenuItem } from '@ariakit/react';

type EditSettingMenuItemProps = {
	id: string;
	index: number;
	type: 'category' | WidgetSetting.NonCategory['type'];
	categoryId?: string;
	sectionId?: string;
};

export default function EditSettingMenuItem({
	id,
	index,
	type,
	categoryId,
	sectionId,
}: EditSettingMenuItemProps) {
	const { openDialog } = useDialog();
	const { getCategory, getSetting, idExists, getConditionIds } =
		useWidgetSettingsEditor();
	const { editCategory, editSection, editSetting } =
		useWidgetSettingsEditorDispatch();

	function onEdit() {
		switch (type) {
			case 'category':
				{
					const category = getCategory(id);
					if (!category) return;

					openDialog(
						'Edit Category',
						<EditWidgetCategoryDialog
							id={id}
							label={i18nStringTransform(category.label)}
							idExists={idExists}
							onSave={(newId, newLabel) => {
								editCategory(newId, index, newLabel);
							}}
						/>,
					);
				}
				break;
			case 'section':
			case 'multi-section':
				{
					if (!categoryId) return;
					const section = getSetting(id, categoryId);
					if (!section || !('settings' in section)) return;

					openDialog(
						'Edit Group',
						<EditWidgetSectionDialog
							id={id}
							label={i18nStringTransform(section.label)}
							type={section.type}
							condition={section.condition}
							searchTags={section.searchTags}
							idExists={idExists}
							onSave={(
								newId,
								newLabel,
								newType,
								newCondition,
								newSearchTags,
							) => {
								editSection(
									newId,
									index,
									newLabel,
									newType,
									newCondition,
									newSearchTags,
									categoryId,
								);
							}}
						/>,
					);
				}
				break;
			default: {
				if (!categoryId) return;
				const setting = getSetting(id, categoryId, sectionId);
				if (!setting || 'settings' in setting) return;

				const { label, ...data } = setting;

				openDialog(
					'Edit Setting',
					<EditWidgetSettingDialog
						id={id}
						label={i18nStringTransform(setting.label)}
						data={data}
						conditionIds={getConditionIds(categoryId, sectionId).filter(
							conditionId => {
								return conditionId !== id;
							},
						)}
						idExists={idExists}
						onSave={(newId, newLabel, newData) => {
							editSetting(
								newId,
								index,
								{ label: newLabel, ...newData },
								categoryId,
								sectionId,
							);
						}}
					/>,
				);
			}
		}
	}

	return (
		<MenuItem className='dark-menu-item' onClick={onEdit}>
			<PencilSvg className='size-4' />
			<p>Edit</p>
		</MenuItem>
	);
}
