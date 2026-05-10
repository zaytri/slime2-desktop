import { SETTINGS_DATA, type WidgetSetting } from '@@/json/widgetSettings';
import CubeSvg from '@@/svg/CubeSvg';
import GridSvg from '@@/svg/GridSvg';
import clsx from 'clsx';
import Tag from './Tag';

type SettingTypeTagProps = {
	type: WidgetSetting.NonCategory['type'] | 'category';
};

export default function SettingTypeTag({ type }: SettingTypeTagProps) {
	return (
		<Tag
			label={type === 'category' ? 'Category' : SETTINGS_DATA[type].label}
			icon={
				type === 'category' ||
				type === 'section' ||
				type === 'multi-section' ? (
					<GridSvg className='h-4' />
				) : (
					<CubeSvg className='h-4' />
				)
			}
			className={clsx(
				'border-2 border-green-900 bg-green-800 py-1 text-3.5 font-semibold',
				type === 'category' && 'border-yellow-900! bg-yellow-800!',
				type === 'section' && 'border-cyan-900! bg-cyan-800!',
				type === 'multi-section' && 'border-blue-950! bg-blue-900!',
			)}
		/>
	);
}
