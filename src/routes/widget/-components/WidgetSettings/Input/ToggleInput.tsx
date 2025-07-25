import CheckSvg from '@/components/svg/CheckSvg';
import XSvg from '@/components/svg/XSvg';
import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { Field, Label, Switch } from '@headlessui/react';
import { memo } from 'react';
import { z } from 'zod/v4-mini';
import InputDescription from './InputDescription';

const ToggleInput = memo(function ToggleInput(
	setting: Props.WithId<WidgetSetting.Input.Toggle>,
) {
	const key = useWidgetValueKey(setting.id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);

	// default to false
	const value = z
		.catch(z.boolean(), setting.defaultValue ?? false)
		.parse(widgetValue);

	return (
		<Field>
			<Switch
				className='input-wrapper group cursor-pointer items-center justify-between p-0'
				checked={value}
				onChange={checked => {
					setWidgetValue(checked);
				}}
				// allows using arrow keys to toggle the switch
				onKeyDown={event => {
					// only run this on this focused element
					if (document.activeElement !== event.currentTarget) return;

					const newCheckedValue =
						event.key === 'ArrowRight' || event.key === 'ArrowUp'
							? true
							: event.key === 'ArrowLeft' || event.key === 'ArrowDown'
								? false
								: null;

					if (newCheckedValue !== null) {
						event.preventDefault();
						setWidgetValue(newCheckedValue);
					}
				}}
			>
				{({ checked }) => (
					<>
						<Label className='flex-1 cursor-pointer py-1 pl-2 text-left'>
							{i18nStringTransform(setting.label)}
						</Label>
						<div className='group rounded-1.5 mr-1 inline-flex h-6 w-11 cursor-pointer items-center bg-stone-300 text-stone-400 transition group-data-checked:bg-lime-600 group-data-checked:text-lime-700 group-data-focus:outline-2 group-data-focus:outline-black'>
							<span className='rounded-1 size-4 translate-x-1 cursor-pointer bg-white p-1 shadow transition group-data-checked:translate-x-6'>
								{checked ? (
									<CheckSvg className='size-full' />
								) : (
									<XSvg className='size-full' />
								)}
							</span>
						</div>
					</>
				)}
			</Switch>

			<InputDescription value={setting.description} />
		</Field>
	);
});

export default ToggleInput;
