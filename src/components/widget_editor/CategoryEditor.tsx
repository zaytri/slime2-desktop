import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSetting } from '@@/json/widgetSettings';
import SettingHeader from './SettingHeader';
import SettingMenuButton from './SettingMenuButton';

export type CategoryEditorProps = {
	id: string;
	label: string;
	onEdit: VoidFunction;
	onMoveUp?: VoidFunction;
	onMoveDown?: VoidFunction;
	onAdd: (value: WidgetSetting.NonCategory['type']) => void;
	addOptions: {
		label: string;
		options: { label: string; value: WidgetSetting.NonCategory['type'] }[];
	}[];
	onDemote: (
		type: WidgetSetting.Section['type'] | WidgetSetting.MultiSection['type'],
		categoryId: string,
	) => void;
	demoteOptions: {
		label: string;
		value: string;
	}[];
	onDelete: VoidFunction;
};

export default function CategoryEditor({
	id,
	label,
	onEdit,
	onMoveUp,
	onMoveDown,
	onAdd,
	addOptions,
	onDemote,
	demoteOptions,
	onDelete,
	children,
}: Props.WithChildren<CategoryEditorProps>) {
	return (
		<div className='flex flex-col'>
			<SettingHeader id={id} type='category' label={i18nStringTransform(label)}>
				<SettingMenuButton
					onEdit={onEdit}
					onMoveUp={onMoveUp}
					onMoveDown={onMoveDown}
					onAdd={onAdd}
					addOptions={addOptions}
					onDemote={onDemote}
					demoteOptions={demoteOptions}
					onDelete={onDelete}
					className='text-yellow-800 over:border-yellow-900! over:bg-yellow-800!'
				/>
			</SettingHeader>

			<div className='-mt-1 flex flex-col gap-2 rounded-bl-2 border-l-8 border-yellow-900 pt-3 pb-2 pl-2'>
				{children}
			</div>
		</div>
	);
}
