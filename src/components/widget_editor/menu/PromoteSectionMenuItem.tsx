import useWidgetSettingsEditor from '@/contexts/widget_settings_editor/useWidgetSettingsEditor';
import { useWidgetSettingsEditorDispatch } from '@/contexts/widget_settings_editor/useWidgetSettingsEditorDispatch';
import ArrowUpTraySvg from '@@/svg/ArrowUpTraySvg';
import { MenuItem } from '@ariakit/react';

type PromoteSectionMenuItemProps = {
	id: string;
	categoryId: string;
};

export default function PromoteSectionMenuItem({
	id,
	categoryId,
}: PromoteSectionMenuItemProps) {
	const { getSetting } = useWidgetSettingsEditor();
	const { promoteSection } = useWidgetSettingsEditorDispatch();

	function onPromote() {
		const section = getSetting(id, categoryId);

		if (section && 'settings' in section) {
			promoteSection(id, categoryId, section);
		}
	}

	return (
		<MenuItem className='dark-menu-item' onClick={onPromote}>
			<ArrowUpTraySvg className='size-4' />
			<p>Promote To Category</p>
		</MenuItem>
	);
}
