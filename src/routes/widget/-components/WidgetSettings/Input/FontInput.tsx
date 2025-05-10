import TriangleRightSvg from '@/components/svg/TriangleRightSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { Field, Label } from '@headlessui/react';
import clsx from 'clsx';
import { memo } from 'react';
import { z } from 'zod';
import InputDescription from './InputDescription';

const FontInput = memo(function FontInput(
	setting: Props.WithId<WidgetSetting.Input.Font>,
) {
	const key = useWidgetValueKey(setting.id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);
	const { open } = useDialog();

	const value = z
		.string()
		.catch(setting.defaultValue ?? '')
		.parse(widgetValue);

	const placeholder = setting.placeholder
		? i18nStringTransform(setting.placeholder)
		: 'Select font...';

	function openSelectFontDialog() {
		open({
			name: 'SelectFont',
			payload: { value, onChange: setWidgetValue },
		});
	}

	return (
		<Field>
			<button
				type='button'
				className='input-wrapper group flex-col'
				onClick={openSelectFontDialog}
				// allows using arrow right/down to open the select font dialog
				onKeyDown={event => {
					// only run this on this focused element
					if (document.activeElement !== event.currentTarget) return;

					if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
						event.preventDefault();
						openSelectFontDialog();
					}
				}}
			>
				<Label className='input-label'>
					{i18nStringTransform(setting.label)}
				</Label>

				<div className='flex items-center justify-between gap-2'>
					<p
						className={clsx('flex-1', !value && 'text-stone-400')}
						style={{ fontFamily: `"${value}", sans-serif` }}
					>
						{value || placeholder}
					</p>

					<div className='rounded-1 group-over:bg-black group-over:text-white flex size-5 items-center justify-center p-1 group-data-over:outline-2'>
						<TriangleRightSvg className='-mt-1 size-2' />
					</div>
				</div>
			</button>

			<InputDescription value={setting.description} />
		</Field>
	);
});

export default FontInput;
