import useWidgetSettingsEditor from '@/contexts/widget_settings_editor/useWidgetSettingsEditor';
import { useWidgetSettingsEditorDispatch } from '@/contexts/widget_settings_editor/useWidgetSettingsEditorDispatch';
import ArrowDownSvg from '@@/svg/ArrowDownSvg';
import ArrowUpSvg from '@@/svg/ArrowUpSvg';
import { MenuItem } from '@ariakit/react';

type SwapSettingIndexMenuItemsProps = {
	index: number;
	categoryId?: string;
	sectionId?: string;
};

export default function SwapSettingIndexMenuItems({
	index,
	categoryId,
	sectionId,
}: SwapSettingIndexMenuItemsProps) {
	const { settings, getCategory, getSetting } = useWidgetSettingsEditor();
	const { swapIndex } = useWidgetSettingsEditorDispatch();

	const groupLength = Object.keys(
		(categoryId
			? sectionId
				? getSetting(sectionId, categoryId)
				: getCategory(categoryId)
			: settings) || {},
	).length;

	// second and third checks are edge case checks
	const canSwapUp = index > 0 && groupLength > 0 && index < groupLength;
	const canSwapDown = index < groupLength - 1 && groupLength > 0 && index >= 0;

	return (
		<>
			{/* Move Up */}
			<MenuItem
				disabled={!canSwapUp}
				hideOnClick={false}
				className='dark-menu-item'
				onClick={() => {
					if (!canSwapUp) return;

					swapIndex(index, index - 1, categoryId, sectionId);
				}}
			>
				<ArrowUpSvg className='h-3.5 w-4' />
				<p>Move Up</p>
			</MenuItem>

			{/* Move Down */}
			<MenuItem
				disabled={!canSwapDown}
				hideOnClick={false}
				className='dark-menu-item'
				onClick={() => {
					if (!canSwapDown) return;

					swapIndex(index, index + 1, categoryId, sectionId);
				}}
			>
				<ArrowDownSvg className='h-3.5 w-4' />
				<p>Move Down</p>
			</MenuItem>
		</>
	);
}
