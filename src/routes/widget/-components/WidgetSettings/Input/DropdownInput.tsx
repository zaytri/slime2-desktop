import TriangleDownSvg from '@/components/svg/TriangleDownSvg';
import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import { OptionValue, WidgetSetting } from '@/helpers/json/widgetSettings';
import {
	Field,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from '@headlessui/react';
import { memo } from 'react';
import { z } from 'zod/v4-mini';
import InputDescription from './InputDescription';

const DropdownInput = memo(function DropdownInput(
	setting: Props.WithId<WidgetSetting.Input.Dropdown>,
) {
	const key = useWidgetValueKey(setting.id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);

	// default to the value of the first option
	const value = z
		.catch(
			z.union([z.string(), z.number(), z.boolean()]),
			setting.defaultValue ?? setting.options[0].value,
		)
		.parse(widgetValue);

	const placeholder = setting.placeholder
		? i18nStringTransform(setting.placeholder)
		: 'Select...';

	const optionLabels = new Map<OptionValue, string>();
	setting.options.forEach(option => {
		optionLabels.set(option.value, i18nStringTransform(option.label));
	});

	return (
		<Field>
			<Listbox value={value} onChange={setWidgetValue}>
				<ListboxButton className='input-wrapper group flex-col'>
					<label className='input-label'>
						{i18nStringTransform(setting.label)}
					</label>

					<div className='group font-quicksand flex w-full items-center justify-between gap-2'>
						<p className='flex-1 text-left'>
							{value === undefined ? placeholder : optionLabels.get(value)}
						</p>

						<div className='rounded-1 flex size-5 items-center justify-center group-data-over:bg-black group-data-over:text-white group-data-over:outline-2'>
							<TriangleDownSvg className='size-3 pt-0.5' />
						</div>
					</div>
				</ListboxButton>

				<ListboxOptions
					anchor={{
						to: 'bottom',
						gap: 6,
						padding: 32,
					}}
					className='font-quicksand rounded-2 flex w-(--button-width) flex-col bg-white shadow-md outline-2'
				>
					{setting.options.map(option => {
						return (
							<ListboxOption
								key={i18nStringTransform(option.label)}
								value={option.value}
								className={
									'px-2 py-1 data-focus:bg-lime-200 data-focus:font-semibold data-selected:bg-lime-600 data-selected:font-semibold data-selected:text-white'
								}
							>
								{i18nStringTransform(option.label)}
							</ListboxOption>
						);
					})}
				</ListboxOptions>
			</Listbox>

			<InputDescription value={setting.description} />
		</Field>
	);
});

export default DropdownInput;
