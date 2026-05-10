import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSetting } from '@@/json/widgetSettings';
import clsx from 'clsx';
import SettingHeader from './SettingHeader';
import SettingEditorMenu from './menu/SettingEditorMenu';

type SectionEditorProps = {
	id: string;
	index: number;
	categoryId: string;
	setting: DistributivePick<
		WidgetSetting.AnySection,
		'label' | 'condition' | 'searchTags' | 'type'
	>;
};

export default function SectionEditor({
	id,
	index,
	categoryId,
	setting,
	children,
}: Props.WithChildren<SectionEditorProps>) {
	return (
		<div className='flex flex-col'>
			<SettingHeader
				id={id}
				type={setting.type}
				label={i18nStringTransform(setting.label)}
			>
				<SettingEditorMenu
					id={id}
					index={index}
					type={setting.type}
					categoryId={categoryId}
				/>
			</SettingHeader>

			<div
				className={clsx(
					'-mt-1 flex flex-col gap-2 rounded-bl-2 border-l-8 pt-3 pb-2 pl-2',
					setting.type === 'section' && 'border-cyan-900',
					setting.type === 'multi-section' && 'border-blue-950',
				)}
			>
				{children}
			</div>
		</div>
	);
}
