import { useDialog } from '@/contexts/dialog/useDialog';
import { getWidgetValueChildKey } from '@/contexts/widget_setting_parent/useWidgetValueKey';
import WidgetSettingParentProvider from '@/contexts/widget_setting_parent/WidgetSettingParentProvider';
import { useWidgetValuesDispatch } from '@/contexts/widget_values/useWidgetValuesDispatch';
import type { WidgetSetting } from '@/helpers/json/widgetSettings';
import { widgetSettingsScrollContainerId } from '@/helpers/scroll';
import useAutoScrollDisclosureOpen from '@/hooks/useAutoScrollDisclosureOpen';
import CreateMultiSubsectionDialog from '@@/dialog/CreateMultiSubsectionDialog';
import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from '@headlessui/react';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';
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

export default function SettingMultiSection({
	id,
	label,
	values,
	onChange,
	settings,
}: SettingMultiSectionProps) {
	const { openDialog } = useDialog();
	const { setValue: set, duplicate } = useWidgetValuesDispatch();
	const [addedId, setAddedId] = useState<string>('');

	const disclosureButtonRef = useRef<HTMLButtonElement>(null);
	useAutoScrollDisclosureOpen(
		disclosureButtonRef,
		widgetSettingsScrollContainerId,
	);

	useEffect(() => {
		if (!addedId) return;

		const subSectionDisclosureButton = document.getElementById(
			`${addedId}.button`,
		);
		subSectionDisclosureButton?.click();
	}, [addedId]);

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
		<Disclosure as='section' className='my-1 flex flex-col'>
			<DisclosureButton
				className='group/button z-10 flex items-center rounded-2 border border-white bg-zinc-50 bg-linear-to-b from-zinc-50 to-zinc-100 px-4 text-zinc-800 outline-2 outline-zinc-300 text-shadow-[0_1px_white] data-open:rounded-b-0 data-open:bg-none over:bg-lime-200 over:bg-none over:text-green-900 over:outline-4 over:outline-offset-0! over:outline-lime-600 over:text-shadow-none'
				id={id}
				ref={disclosureButtonRef}
			>
				<h3 className='flex-1 py-2 text-left font-mochiy text-4.5'>{label}</h3>

				<div className='flex items-center justify-center rounded-1 p-1 group-data-open/button:rotate-180 group-data-over/button:bg-lime-600 group-data-over/button:text-lime-200 group-data-over/button:outline-none'>
					<TriangleDownSvg className='size-4' />
				</div>
			</DisclosureButton>

			<DisclosurePanel className='mt-0.5 flex flex-col gap-4 rounded-2 rounded-t-0 border border-white bg-zinc-100 bg-linear-to-b from-zinc-50 to-zinc-100 p-4 outline-2 outline-zinc-300'>
				<button
					type='button'
					className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-1.5 font-fredoka text-4.5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
					onClick={() => {
						openDialog(
							'Create New Item',
							<CreateMultiSubsectionDialog
								multiSectionName={label}
								onCreate={name => {
									const newSubsectionName = name.trim() || `New ${label} Item`;
									const newSubsectionId =
										createNewSubsection(newSubsectionName);
									onChange([newSubsectionId, ...values]);
									setAddedId(newSubsectionId);
								}}
							/>,
						);
					}}
				>
					<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
					<div className='relative flex flex-1 items-center justify-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
						<PlusSvg className='size-4.5' />
						<p>Create New {label} Item</p>
					</div>
				</button>

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
}
