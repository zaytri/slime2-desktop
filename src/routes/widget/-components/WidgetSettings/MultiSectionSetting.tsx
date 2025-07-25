import RenameDialog from '@/components/dialog/RenameDialog';
import TriangleDownSvg from '@/components/svg/TriangleDownSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import { getWidgetValueChildKey } from '@/contexts/widget_setting_parent/useWidgetValueKey';
import WidgetSettingParentProvider from '@/contexts/widget_setting_parent/WidgetSettingParentProvider';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { useWidgetValuesDispatch } from '@/contexts/widget_values/useWidgetValuesDispatch';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from '@headlessui/react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { memo, useEffect, useRef } from 'react';
import { z } from 'zod/v4-mini';
import MultiSubsection from './MultiSubsection';
import NonCategorySettings from './NonCategorySettings';

const MultiSectionSetting = memo(function MultiSectionSetting({
	id,
	label,
	settings,
}: Props.WithId<WidgetSetting.MultiSection>) {
	const { widgetValue, setWidgetValue } = useWidgetValue(id);
	const { duplicate, set } = useWidgetValuesDispatch();
	const { hash, state: locationState } = useLocation();
	const navigate = useNavigate();
	const { openDialog } = useDialog();
	const mainDisclosureButtonRef = useRef<HTMLButtonElement>(null);

	const subsections = z.catch(z.array(z.string()), []).parse(widgetValue);

	function removeValueAtIndex(index: number) {
		const newSubsections = [...subsections];
		newSubsections.splice(index, 1);
		setWidgetValue(newSubsections);
	}

	function createNewSubsection(value: string = 'New') {
		const newId = `${id}[${nanoid()}]`;
		set(newId, value);
		return { id: newId, value };
	}

	useEffect(() => {
		const button = mainDisclosureButtonRef.current;
		if (!button) return;

		// open multi section automatically if navigated from sidebar
		if (hash === id && !button.hasAttribute('data-open')) {
			button.click();
		}
	}, [hash, locationState]);

	return (
		<Disclosure
			as='section'
			className='rounded-2 group/parent flex flex-col border border-white bg-stone-100 outline outline-stone-300'
		>
			<DisclosureButton
				className='rounded-2 group/parent flex items-center px-4 outline-offset-0!'
				ref={mainDisclosureButtonRef}
				onClick={() => {
					navigate({ href: `#${id}` });
				}}
			>
				<h3
					id={id}
					className='text-5 flex-1 scroll-mt-4 py-2 text-left font-medium'
				>
					{i18nStringTransform(label)}
				</h3>

				<div className='rounded-1 flex items-center justify-center p-1 group-data-open/parent:rotate-180 group-data-over/parent:bg-black group-data-over/parent:text-white group-data-over/parent:outline-2'>
					<TriangleDownSvg className='size-4 pt-1' />
				</div>
			</DisclosureButton>

			<DisclosurePanel className='flex flex-col gap-4 border-t border-white p-4 pt-0 inset-shadow-sm'>
				<div className='-mx-4 h-px bg-stone-300 shadow'></div>
				<button
					type='button'
					className='rounded-2 over:translate-y-0.5 over:from-stone-300 over:to-stone-200 over:shadow-none font-quicksand w-full flex-1 border border-white bg-stone-400 bg-linear-to-b from-stone-200 to-stone-300 py-1 font-medium text-stone-700 shadow-[0_2px_0_1px] shadow-stone-400 outline outline-stone-400 focus-visible:outline-2 focus-visible:outline-offset-0! focus-visible:outline-black'
					onClick={() => {
						openDialog(
							<RenameDialog
								onSave={value => {
									const newSubsection = createNewSubsection(value);
									setWidgetValue([newSubsection.id, ...subsections]);
								}}
							/>,
						);
					}}
				>
					Add New
				</button>

				{subsections.map((subsectionId, index) => {
					return (
						<WidgetSettingParentProvider key={subsectionId} id={subsectionId}>
							<MultiSubsection
								id={subsectionId}
								onDelete={() => {
									removeValueAtIndex(index);
								}}
								onDuplicate={value => {
									const newSubsection = createNewSubsection(`${value} (copy)`);

									const newSubsections = [...subsections];
									newSubsections.splice(index, 0, newSubsection.id);
									setWidgetValue(newSubsections);

									// duplicate all values from source subsection
									Object.keys(settings).forEach(settingId => {
										const sourceKey = getWidgetValueChildKey(
											subsectionId,
											settingId,
										);
										const newKey = getWidgetValueChildKey(
											newSubsection.id,
											settingId,
										);
										duplicate(sourceKey, newKey);
									});
								}}
							>
								<NonCategorySettings settings={settings} />
							</MultiSubsection>
						</WidgetSettingParentProvider>
					);
				})}
			</DisclosurePanel>
		</Disclosure>
	);
});

export default MultiSectionSetting;
