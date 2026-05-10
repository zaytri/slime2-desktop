import CategoryEditor from '@/components/widget_editor/CategoryEditor';
import SectionEditor from '@/components/widget_editor/SectionEditor';
import SettingEditor from '@/components/widget_editor/SettingEditor';
import { useDialog } from '@/contexts/dialog/useDialog';
import useWidgetSettingsEditor from '@/contexts/widget_settings_editor/useWidgetSettingsEditor';
import { useWidgetSettingsEditorDispatch } from '@/contexts/widget_settings_editor/useWidgetSettingsEditorDispatch';
import { i18nStringTransform } from '@/helpers/i18n';
import EditWidgetCategoryDialog from '@@/dialog/edit_widget_setting/EditWidgetCategoryDialog.tsx';
import CheckSvg from '@@/svg/CheckSvg';
import PlusSvg from '@@/svg/PlusSvg';
import XSvg from '@@/svg/XSvg';
import { Checkbox } from '@ariakit/react';
import { useState } from 'react';

export default function WidgetSettingsEditor() {
	const { settings } = useWidgetSettingsEditor();
	const [showDetails, setShowDetails] = useState(true);

	return (
		<section className='flex flex-2 flex-col gap-2'>
			<div className='flex items-end gap-2'>
				<h2 className='flex-1 px-3 font-mochiy text-4.5 text-white text-shadow-[0_1px_black]'>
					Widget Settings
				</h2>

				<ShowSettingsToggle value={showDetails} onChange={setShowDetails} />
				<AddCategoryButton />
			</div>

			<div className='flex flex-1 flex-col overflow-hidden light-container'>
				<div className='flex flex-1 flex-col gap-2 overflow-y-auto p-3 pr-1'>
					{Object.entries(settings).map(
						([categoryId, category], categoryIndex) => {
							return (
								<CategoryEditor
									key={categoryId}
									id={categoryId}
									index={categoryIndex}
									label={i18nStringTransform(category.label)}
								>
									{Object.entries(category.settings).map(
										([settingId, setting], settingIndex) => {
											if ('settings' in setting) {
												return (
													<SectionEditor
														key={settingId}
														id={settingId}
														index={settingIndex}
														categoryId={categoryId}
														setting={setting}
													>
														{Object.entries(setting.settings).map(
															([subSettingId, subSetting], subSettingIndex) => {
																return (
																	<SettingEditor
																		key={subSettingId}
																		id={subSettingId}
																		index={subSettingIndex}
																		categoryId={categoryId}
																		sectionId={settingId}
																		setting={subSetting}
																		showDetails={showDetails}
																	/>
																);
															},
														)}
													</SectionEditor>
												);
											} else {
												return (
													<SettingEditor
														key={settingId}
														id={settingId}
														index={settingIndex}
														categoryId={categoryId}
														setting={setting}
														showDetails={showDetails}
													/>
												);
											}
										},
									)}
								</CategoryEditor>
							);
						},
					)}
				</div>
			</div>
		</section>
	);
}

type ShowSettingsToggleProps = {
	value: boolean;
	onChange: (value: boolean) => void;
};

function ShowSettingsToggle({ value, onChange }: ShowSettingsToggleProps) {
	return (
		<label>
			<Checkbox
				render={<button />}
				checked={value}
				onChange={() => {
					onChange(!value);
				}}
				className='group/check flex items-center gap-2 rounded-1 pl-2 font-fredoka font-medium text-white text-shadow-[0_1px_black] over:outline-2 over:outline-offset-1! over:outline-white'
			>
				<p>Show Setting Details</p>
				<div className='inline-flex w-10 items-center rounded-1 border-2 border-zinc-400 p-0.5 text-zinc-400 transition group-aria-checked/check:border-lime-500'>
					<span className='size-4 translate-x-0 cursor-pointer rounded-0.5 bg-zinc-400 p-0.75 text-white shadow transition group-aria-checked/check:translate-x-full group-aria-checked/check:bg-lime-600'>
						<CheckSvg className='hidden size-full group-aria-checked/check:block' />
						<XSvg className='size-full group-aria-checked/check:hidden' />
					</span>
				</div>
			</Checkbox>
		</label>
	);
}

function AddCategoryButton() {
	const { idExists } = useWidgetSettingsEditor();
	const { addCategory } = useWidgetSettingsEditorDispatch();
	const { openDialog } = useDialog();

	return (
		<button
			type='button'
			className='flex items-center gap-2 rounded-1 px-2 font-fredoka font-medium text-white *:drop-shadow-[0_1px_black] over:outline-2 over:outline-offset-1! over:outline-white'
			onClick={() => {
				openDialog(
					'New Category',
					<EditWidgetCategoryDialog
						idExists={idExists}
						onSave={(newId, newLabel) => {
							addCategory(newId, newLabel);
						}}
					/>,
				);
			}}
		>
			<PlusSvg className='size-3' />
			<p>Add Category</p>
		</button>
	);
}
