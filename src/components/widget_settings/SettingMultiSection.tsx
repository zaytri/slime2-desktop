import { getWidgetValueChildKey } from '@/contexts/widget_setting_parent/useWidgetValueKey';
import WidgetSettingParentProvider from '@/contexts/widget_setting_parent/WidgetSettingParentProvider';
import { useWidgetValuesDispatch } from '@/contexts/widget_values/useWidgetValuesDispatch';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { widgetSettingsScrollContainerId } from '@/helpers/scroll';
import useAutoScrollDisclosureOpen from '@/hooks/useAutoScrollDisclosureOpen';
import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from '@headlessui/react';
import { nanoid } from 'nanoid';
import { memo, useRef, useState } from 'react';
import TextField from '../input_fields/TextField';
import PlusSvg from '../svg/PlusSvg';
import TriangleDownSvg from '../svg/TriangleDownSvg';
import SettingMultiSubsection from './SettingMultiSubsection';
import SettingsGroup from './SettingsGroup';

type SettingMultiSectionProps = {
	id: string;
	label: string;
	settings: WidgetSetting.MultiSection['settings'];
	values: string[];
	onChange: (values: string[]) => void;
};

const SettingMultiSection = memo(function SettingMultiSection({
	id,
	label,
	values,
	onChange,
	settings,
}: SettingMultiSectionProps) {
	const { set, duplicate } = useWidgetValuesDispatch();
	const [newName, setNewName] = useState<string>('');

	const disclosureButtonRef = useRef<HTMLButtonElement>(null);
	useAutoScrollDisclosureOpen(
		disclosureButtonRef,
		widgetSettingsScrollContainerId,
	);

	function removeSubsectionAtIndex(index: number) {
		const newValues = [...values];
		newValues.splice(index, 1);
		onChange(newValues);
	}

	function createNewSubsection(name: string) {
		const newId = `${id}[${nanoid()}]`;
		set(newId, name);
		return newId;
	}

	return (
		<Disclosure as='section' className='flex flex-col'>
			<DisclosureButton
				className='group/button z-10 flex items-center rounded-2 border border-white bg-zinc-50 bg-linear-to-b from-zinc-50 to-zinc-100 px-4 outline-2 outline-zinc-300 text-shadow-[0_1px_white] data-open:rounded-b-0 data-open:bg-none over:bg-lime-200 over:bg-none over:text-green-900 over:outline-4 over:outline-offset-0! over:outline-lime-600 over:text-shadow-none'
				id={id}
				ref={disclosureButtonRef}
			>
				<h3 className='flex-1 py-2 text-left font-fredoka text-5 font-medium'>
					{label}
				</h3>

				<div className='flex items-center justify-center rounded-1 p-1 group-data-open/button:rotate-180 group-data-over/button:bg-lime-600 group-data-over/button:text-lime-200 group-data-over/button:outline-none'>
					<TriangleDownSvg className='size-4' />
				</div>
			</DisclosureButton>

			<DisclosurePanel className='mt-0.5 flex flex-col gap-4 rounded-2 rounded-t-0 border border-white bg-zinc-100 bg-linear-to-b from-zinc-50 to-zinc-100 p-4 outline-2 outline-zinc-300'>
				<div className='flex items-center gap-4'>
					<div className='flex-1'>
						<TextField
							label='Name'
							value={newName}
							placeholder={`New Item`}
							onChange={setNewName}
						/>
					</div>

					<button
						type='button'
						className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-2 text-4.5 font-bold text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
						onClick={() => {
							const newSubsectionName = newName.trim();
							const newSubsectionId = createNewSubsection(
								newSubsectionName || 'New Item',
							);
							onChange([newSubsectionId, ...values]);
							setNewName('');
						}}
					>
						<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
						<div className='relative flex flex-1 items-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
							<PlusSvg className='size-4.5' />
							<p className='-mb-0.5'>Add Item</p>
						</div>
					</button>
				</div>

				{values.map((subsectionId, index) => {
					return (
						<WidgetSettingParentProvider key={subsectionId} id={subsectionId}>
							<SettingMultiSubsection
								id={subsectionId}
								onDelete={() => {
									removeSubsectionAtIndex(index);
								}}
								onDuplicate={sourceName => {
									const newSubsectionId = createNewSubsection(
										`${sourceName} (copy)`,
									);

									const newValues = [...values];
									newValues.splice(index, 0, newSubsectionId);
									onChange(newValues);

									// duplicate all values from source subsection
									Object.keys(settings).forEach(settingId => {
										const sourceKey = getWidgetValueChildKey(
											subsectionId,
											settingId,
										);
										const newKey = getWidgetValueChildKey(
											newSubsectionId,
											settingId,
										);
										duplicate(sourceKey, newKey);
									});
								}}
							>
								<SettingsGroup settings={settings} />
							</SettingMultiSubsection>
						</WidgetSettingParentProvider>
					);
				})}
			</DisclosurePanel>
		</Disclosure>
	);
});

export default SettingMultiSection;
