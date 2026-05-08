import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSetting } from '@@/json/widgetSettings';
import clsx from 'clsx';
import SettingHeader from './SettingHeader';
import SettingMenuButton from './SettingMenuButton';
import SettingProperty from './SettingProperty';

type SettingEditorProps = {
	id: string;
	setting: WidgetSetting.NonGroup;
	showDetails: boolean;

	onEdit: VoidFunction;
	onMoveUp?: VoidFunction;
	onMoveDown?: VoidFunction;
	onMoveTo: (value: string) => void;
	moveToOptions: {
		label: string;
		value: string;
		type:
			| WidgetSetting.Section['type']
			| WidgetSetting.MultiSection['type']
			| 'category';
		disabled?: boolean;
	}[];
	onDuplicate: VoidFunction;
	onDelete: VoidFunction;
};

export default function SettingEditor({
	id,
	setting,
	showDetails,

	onEdit,
	onMoveUp,
	onMoveDown,
	onMoveTo,
	moveToOptions,
	onDuplicate,
	onDelete,
}: SettingEditorProps) {
	const values: {
		label: string;
		value: unknown;
		full?: boolean;
	}[] = [];

	if ('defaultValue' in setting) {
		values.push({ label: 'Default Value', value: setting.defaultValue });
	}

	if ('min' in setting) {
		values.push({ label: 'Min', value: setting.min });
	}

	if ('max' in setting) {
		values.push({ label: 'Max', value: setting.max });
	}

	if ('step' in setting) {
		values.push({ label: 'Step', value: setting.step });
	}

	if ('placeholder' in setting) {
		values.push({ label: 'Placeholder', value: setting.placeholder });
	}

	if ('description' in setting) {
		values.push({
			label: 'Description',
			value: setting.description,
			full: true,
		});
	}

	return (
		<div className='flex flex-1 flex-col'>
			<SettingHeader
				id={id}
				type={setting.type}
				label={i18nStringTransform(setting.label)}
				hasValues={showDetails && values.length > 0}
			>
				<SettingMenuButton
					onEdit={onEdit}
					onMoveUp={onMoveUp}
					onMoveDown={onMoveDown}
					onMoveTo={onMoveTo}
					moveToOptions={moveToOptions}
					onDuplicate={onDuplicate}
					onDelete={onDelete}
					className='text-green-800 over:border-green-900! over:bg-green-800!'
				/>
			</SettingHeader>

			{showDetails && (
				<div className='mr-9.25 flex'>
					<div className='m-px -mt-0.5 flex flex-1 flex-wrap gap-2 rounded-b-2 border-2 border-x-8 border-green-900 bg-green-100 px-2 py-2 outline outline-green-900 empty:hidden'>
						{values.map(({ label, value, full }) => {
							return (
								<SettingProperty
									key={label}
									label={label}
									className={clsx(full && 'w-full')}
								>
									{JSON.stringify(value)}
								</SettingProperty>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
