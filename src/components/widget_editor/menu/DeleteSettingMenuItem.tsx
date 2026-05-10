import { useDialog } from '@/contexts/dialog/useDialog';
import useWidgetSettingsEditor from '@/contexts/widget_settings_editor/useWidgetSettingsEditor';
import { useWidgetSettingsEditorDispatch } from '@/contexts/widget_settings_editor/useWidgetSettingsEditorDispatch';
import GenericDeleteDialog from '@@/dialog/GenericDeleteDialog';
import GenericErrorDialog from '@@/dialog/GenericErrorDialog';
import { SETTINGS_DATA } from '@@/json/widgetSettings';
import TrashSvg from '@@/svg/TrashSvg';
import { MenuItem } from '@ariakit/react';

type DeleteSettingMenuItemProps = {
	id: string;
	categoryId?: string;
	sectionId?: string;
};

export default function DeleteSettingMenuItem({
	id,
	categoryId,
	sectionId,
}: DeleteSettingMenuItemProps) {
	const { openDialog } = useDialog();
	const { getCategory, getSetting } = useWidgetSettingsEditor();
	const { deleteCategory, deleteSetting } = useWidgetSettingsEditorDispatch();

	function onDelete() {
		if (categoryId) {
			const setting = getSetting(id, categoryId, sectionId);
			if (!setting) return;

			const label = SETTINGS_DATA[setting.type].label;

			if ('settings' in setting && Object.values(setting.settings).length > 0) {
				openDialog(
					`Can't Delete ${label}!`,
					<GenericErrorDialog>
						This {label} contains some settings. It cannot be deleted until
						those are removed.
					</GenericErrorDialog>,
				);
				return;
			} else {
				openDialog(
					`Delete ${label}`,
					<GenericDeleteDialog
						onDelete={() => {
							deleteSetting(id, categoryId, sectionId);
						}}
					>
						Are you sure you want to <strong>delete</strong> this {label}?
					</GenericDeleteDialog>,
				);
			}
		} else {
			const category = getCategory(id);
			if (!category) return;

			if (Object.values(category.settings).length > 0) {
				openDialog(
					"Can't Delete Category!",
					<GenericErrorDialog>
						This Category contains some settings. It cannot be deleted until
						those are removed.
					</GenericErrorDialog>,
				);
				return;
			} else {
				openDialog(
					'Delete Category',
					<GenericDeleteDialog
						onDelete={() => {
							deleteCategory(id);
						}}
					>
						Are you sure you want to <strong>delete</strong> this Category?
					</GenericDeleteDialog>,
				);
			}
		}
	}

	return (
		<MenuItem
			className='dark-menu-item text-rose-300! data-active-item:bg-rose-300! data-active-item:text-rose-950!'
			onClick={onDelete}
		>
			<TrashSvg className='size-4' />
			<p>Delete</p>
		</MenuItem>
	);
}
