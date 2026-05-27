import { i18nStringTransform, type I18nString } from '@/helpers/i18n';
import type { WidgetSetting } from '@@/json/widgetSettings';
import clsx from 'clsx';
import SettingEditorMenu from './menu/SettingEditorMenu';
import SettingHeader from './SettingHeader';
import SettingProperty from './SettingProperty';

type SettingEditorProps = {
	id: string;
	index: number;
	categoryId: string;
	sectionId?: string;
	setting: WidgetSetting.NonGroup;
	showDetails: boolean;
};

export default function SettingEditor({
	id,
	index,
	categoryId,
	sectionId,
	setting,
	showDetails,
}: SettingEditorProps) {
	const values: ValueDisplay[] = [];

	if ('halfSpan' in setting && setting.halfSpan !== undefined) {
		values.push(displayValue('Half Span', setting.halfSpan));
	}

	if ('defaultValue' in setting && setting.defaultValue !== undefined) {
		values.push(displayValue('Default Value', setting.defaultValue));
	}

	if ('src' in setting && setting.src !== undefined) {
		values.push(displayValue('Src', setting.src));
	}

	if ('alt' in setting && setting.alt !== undefined) {
		values.push(displayI18n('Alt', setting.alt));
	}

	if ('min' in setting && setting.min !== undefined) {
		values.push(displayValue('Min', setting.min));
	}

	if ('max' in setting && setting.max !== undefined) {
		values.push(displayValue('Max', setting.max));
	}

	if ('step' in setting && setting.step !== undefined) {
		values.push(displayValue('Step', setting.step));
	}

	if ('placeholder' in setting && setting.placeholder !== undefined) {
		values.push(displayI18n('Placeholder', setting.placeholder));
	}

	if (
		'options' in setting &&
		setting.options !== undefined &&
		setting.options.length > 0
	) {
		values.push(displayValue('Options', setting.options));
	}

	if (
		'condition' in setting &&
		setting.condition !== undefined &&
		Object.values(setting.condition).length > 0
	) {
		values.push(displayObject('Condition', setting.condition));
	}

	if ('description' in setting && setting.description !== undefined) {
		values.push(displayI18n('Description', setting.description, true));
	}

	return (
		<div className='flex flex-1 flex-col'>
			<SettingHeader
				id={id}
				type={setting.type}
				label={i18nStringTransform(setting.label)}
				hasValues={showDetails && values.length > 0}
			>
				<SettingEditorMenu
					id={id}
					index={index}
					type={setting.type}
					categoryId={categoryId}
					sectionId={sectionId}
				/>
			</SettingHeader>

			{showDetails && (
				<div className='mr-9.25 flex'>
					<div className='m-px -mt-0.5 flex flex-1 flex-wrap gap-2 rounded-b-2 border-2 border-x-8 border-green-900 bg-green-100 px-2 py-2 outline outline-green-900 empty:hidden'>
						{values.map(({ label, value, full }) => {
							if (Array.isArray(value) && value.length === 0) {
								return;
							}

							return (
								<SettingProperty
									key={label}
									label={label}
									className={clsx(full && 'w-full')}
								>
									{Array.isArray(value) ? (
										<div className='flex flex-col'>
											{value.map((item, index) => {
												return (
													<p
														key={index}
														className='after:content-[","] first:before:content-["["] last:after:content-["]"]'
													>
														{JSON.stringify(item)}
													</p>
												);
											})}
										</div>
									) : typeof value === 'string' ? (
										<p className='whitespace-pre-line before:content-["\""] after:content-["\""]'>
											{value}
										</p>
									) : (
										<p>{JSON.stringify(value)}</p>
									)}
								</SettingProperty>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

type ValueDisplay = {
	label: string;
	value: unknown;
	full?: boolean;
};

function displayValue(
	label: string,
	value: unknown,
	full: boolean = false,
): ValueDisplay {
	return { label, value, full: full || Array.isArray(value) };
}

function displayI18n(
	label: string,
	i18n: I18nString,
	alwaysFull: boolean = false,
): ValueDisplay {
	return typeof i18n === 'string'
		? displayValue(label, i18n, alwaysFull)
		: displayObject(label, i18n);
}

function displayObject(
	label: string,
	object: Record<string, unknown>,
): ValueDisplay {
	return {
		label,
		value: Object.entries(object).map(([key, value]) => {
			return { [key]: value };
		}),
		full: true,
	};
}
