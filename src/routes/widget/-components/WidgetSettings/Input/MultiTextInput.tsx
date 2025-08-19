import ArrowTurnDownLeftSvg from '@/components/svg/ArrowTurnDownLeftSvg';
import XSvg from '@/components/svg/XSvg';
import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { Field, Input, Label } from '@headlessui/react';
import { memo, useState } from 'react';
import { z } from 'zod/mini';
import InputDescription from './InputDescription';

const MultiTextInput = memo(function MultiTextInput(
	setting: Props.WithId<WidgetSetting.Input.MultiText>,
) {
	const key = useWidgetValueKey(setting.id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);
	const [inputValue, setInputValue] = useState<string>('');

	const values = z
		.catch(z.array(z.string()), setting.defaultValue ?? [])
		.parse(widgetValue);

	function removeValueAtIndex(index: number) {
		const newValues = [...values];
		newValues.splice(index, 1);
		setWidgetValue(newValues);
	}

	return (
		<Field>
			<div className='input-wrapper flex-col has-focus-visible:outline-2 has-focus-visible:outline-black'>
				<Label className='input-label'>
					{i18nStringTransform(setting.label)}
				</Label>

				<div className='font-quicksand flex flex-wrap gap-1.5 py-1'>
					{values.map((value, index) => {
						return (
							<button
								key={`${value}-${index}`}
								className='text-3.5 group over:bg-rose-200 flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-200 px-1.5 outline-offset-0!'
								onClick={() => {
									removeValueAtIndex(index);
								}}
								// allow removing value when pressing backspace
								// and using arrow keys to navigate to other values
								onKeyDown={event => {
									// only run this on this focused element
									if (document.activeElement !== event.currentTarget) return;

									if (event.key === 'Backspace') {
										event.preventDefault();
										removeValueAtIndex(index);
									}

									const currentButton = event.currentTarget;

									const buttonToFocus =
										event.key === 'ArrowRight' || event.key === 'ArrowDown'
											? // get the next button
												// or the first button if this is the last button
												index !== values.length - 1
												? currentButton.nextElementSibling
												: currentButton.parentElement?.querySelector('button')
											: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
												? // get the previous button
													// or the last button if this is the first button
													index !== 0
													? currentButton.previousElementSibling
													: currentButton.parentElement?.querySelector(
															'button:last-of-type',
														)
												: null;

									if (buttonToFocus) {
										event.preventDefault();
										(buttonToFocus as HTMLButtonElement).focus();
									}
								}}
							>
								<p>{value}</p>
								<XSvg className='group-over:text-rose-700 size-2 text-stone-400' />
							</button>
						);
					})}

					<div className='flex items-center gap-1'>
						<Input
							autoComplete='off'
							aria-autocomplete='none'
							value={inputValue}
							placeholder={
								setting.placeholder
									? i18nStringTransform(setting.placeholder)
									: undefined
							}
							className='input-class peer w-40'
							onChange={event => {
								setInputValue(event.target.value);
							}}
							// add value when pressing enter
							// remove last value when pressing backspace
							onKeyDown={event => {
								// only run this on this focused element
								if (document.activeElement !== event.currentTarget) return;

								if (event.key === 'Enter') {
									const newValue = inputValue.trim();
									if (newValue) {
										setWidgetValue([...values, newValue]);
										setInputValue('');
									}
								}

								if (event.key === 'Backspace') {
									if (inputValue.length === 0 && values.length > 0) {
										setWidgetValue(values.slice(0, -1));
									}
								}
							}}
						/>
						<ArrowTurnDownLeftSvg className='hidden size-3 peer-data-focus:block' />
					</div>
				</div>
			</div>

			<InputDescription value={setting.description} />
		</Field>
	);
});

export default MultiTextInput;
