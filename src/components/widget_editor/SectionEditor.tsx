import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSetting } from '@@/json/widgetSettings';
import clsx from 'clsx';
import SettingHeader from './SettingHeader';
import SettingMenuButton from './SettingMenuButton';

type SectionEditorProps = {
	id: string;
	setting: Pick<
		WidgetSetting.Section | WidgetSetting.MultiSection,
		'label' | 'condition' | 'searchTags' | 'type'
	>;
	onEdit: VoidFunction;
	onMoveUp?: VoidFunction;
	onMoveDown?: VoidFunction;
	onMoveTo: (value: string) => void;
	moveToOptions: {
		label: string;
		value: string;
		disabled?: boolean;
	}[];
	onAdd: (value: WidgetSetting.NonGroup['type']) => void;
	addOptions: {
		label: string;
		options: { label: string; value: WidgetSetting.NonGroup['type'] }[];
	}[];
	onConvert: (
		value: WidgetSetting.Section['type'] | WidgetSetting.MultiSection['type'],
	) => void;
	convertOptions: {
		label: string;
		value: WidgetSetting.Section['type'] | WidgetSetting.MultiSection['type'];
		disabled?: boolean;
	}[];
	onPromote: VoidFunction;
	onDelete: VoidFunction;
};

export default function SectionEditor({
	id,
	setting,
	onEdit,
	onMoveUp,
	onMoveDown,
	onMoveTo,
	moveToOptions,
	onAdd,
	addOptions,
	onConvert,
	convertOptions,
	onPromote,
	onDelete,
	children,
}: Props.WithChildren<SectionEditorProps>) {
	return (
		<div className='flex flex-col'>
			<SettingHeader
				id={id}
				type={setting.type}
				label={i18nStringTransform(setting.label)}
			>
				<SettingMenuButton
					onEdit={onEdit}
					onMoveUp={onMoveUp}
					onMoveDown={onMoveDown}
					onMoveTo={onMoveTo}
					moveToOptions={moveToOptions}
					onAdd={onAdd}
					addOptions={addOptions}
					onConvert={onConvert}
					convertOptions={convertOptions}
					onPromote={onPromote}
					onDelete={onDelete}
					className={clsx(
						setting.type === 'section' &&
							'text-cyan-800 over:border-cyan-900! over:bg-cyan-800!',
						setting.type === 'multi-section' &&
							'text-blue-900 over:border-blue-950! over:bg-blue-900!',
					)}
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
