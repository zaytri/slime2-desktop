import CategoryEditor from '@/components/widget_editor/CategoryEditor';
import SectionEditor from '@/components/widget_editor/SectionEditor';
import SettingEditor from '@/components/widget_editor/SettingEditor';
import { useDialog } from '@/contexts/dialog/useDialog';
import { i18nStringTransform } from '@/helpers/i18n';
import SetWidgetSettingDialog from '@@/dialog/SetWidgetSettingDialog';
import {
	AVAILABLE_SETTINGS_GROUPED,
	AVAILABLE_SETTINGS_GROUPED_WITH_SECTION,
	SETTINGS_LABELS,
	type WidgetSetting,
	type WidgetSettings,
} from '@@/json/widgetSettings';
import PlusSvg from '@@/svg/PlusSvg';

type WidgetSettingsEditorProps = {
	value: WidgetSettings;
	onChange: (settings: WidgetSettings) => void;
};

export default function WidgetSettingsEditor({
	value,
	onChange,
}: WidgetSettingsEditorProps) {
	const { openDialog } = useDialog();
	const categories = Object.entries(value);

	const categoryOptions: { label: string; value: string }[] = [];
	const groupOptions: {
		label: string;
		value: string;
		type:
			| WidgetSetting.Section['type']
			| WidgetSetting.MultiSection['type']
			| 'category';
	}[] = [];
	categories.forEach(([categoryId, category]) => {
		const categoryOption = {
			label: i18nStringTransform(category.label),
			value: categoryId,
		};
		categoryOptions.push(categoryOption);
		groupOptions.push({ ...categoryOption, type: 'category' });

		Object.entries(category.settings).forEach(([settingId, setting]) => {
			if (setting.type === 'section' || setting.type === 'multi-section') {
				groupOptions.push({
					label: i18nStringTransform(setting.label),
					value: settingId,
					type: setting.type,
				});
			}
		});
	});

	function checkIdExists(newId: string) {
		const ids = new Set<string>();

		// collect all existing ids
		categories.forEach(([categoryId, category]) => {
			ids.add(categoryId);
			Object.entries(category.settings).forEach(([settingId, setting]) => {
				ids.add(settingId);
				if (setting.type === 'section' || setting.type === 'multi-section') {
					Object.keys(setting.settings).forEach(sectionedSettingId => {
						ids.add(sectionedSettingId);
					});
				}
			});
		});

		return ids.has(newId);
	}

	return (
		<section className='flex flex-2 flex-col gap-2'>
			<div className='flex items-end gap-2'>
				<h2 className='flex-1 px-3 font-mochiy text-4.5 text-white text-shadow-[0_1px_black]'>
					Widget Settings
				</h2>

				<button
					type='button'
					className='flex items-center gap-2 font-fredoka font-medium text-white over:underline'
				>
					<PlusSvg className='size-3' />
					<p>Add Category</p>
				</button>
			</div>

			<div className='flex flex-1 flex-col overflow-hidden light-container'>
				<div className='flex flex-1 flex-col gap-2 overflow-y-auto p-3 pr-1'>
					{categories.map(([categoryId, category], categoryIndex) => {
						const categoryLabel = i18nStringTransform(category.label);
						const categorySettings = Object.entries(category.settings);

						return (
							<CategoryEditor
								id={categoryId}
								label={categoryLabel}
								onEdit={() => {
									openDialog(
										'Edit Category',
										<SetWidgetSettingDialog
											id={categoryId}
											label={categoryLabel}
											checkIdExists={checkIdExists}
											onSaveCategory={() => {}}
										/>,
									);
								}}
								onMoveUp={categoryIndex === 0 ? undefined : () => {}}
								onMoveDown={
									categoryIndex === categories.length - 1 ? undefined : () => {}
								}
								onAdd={type => {}}
								addOptions={AVAILABLE_SETTINGS_GROUPED_WITH_SECTION}
								onDemote={(type, categoryId) => {}}
								demoteOptions={categoryOptions}
								onDelete={() => {}}
							>
								{categorySettings.map(([settingId, setting], settingIndex) => {
									if (
										setting.type === 'section' ||
										setting.type === 'multi-section'
									) {
										const sectionSettings = Object.entries(setting.settings);
										return (
											<SectionEditor
												key={settingId}
												id={settingId}
												setting={setting}
												onEdit={() => {
													const label = SETTINGS_LABELS.get(setting.type);
													if (!label) return;

													openDialog(
														`Edit ${label}`,
														<SetWidgetSettingDialog
															id={settingId}
															label={i18nStringTransform(setting.label)}
															condition={setting.condition}
															searchTags={setting.searchTags}
															data={setting}
															checkIdExists={checkIdExists}
															onSaveSetting={() => {}}
														/>,
													);
												}}
												onMoveUp={settingIndex === 0 ? undefined : () => {}}
												onMoveDown={
													settingIndex === categorySettings.length - 1
														? undefined
														: () => {}
												}
												onMoveTo={() => {}}
												moveToOptions={categoryOptions.map(option => {
													// disable option if section is already in this category
													return option.value === categoryId
														? { ...option, disabled: true }
														: option;
												})}
												onAdd={() => {}}
												addOptions={AVAILABLE_SETTINGS_GROUPED}
												onConvert={() => {}}
												convertOptions={(
													['section', 'multi-section'] as (
														| WidgetSetting.Section['type']
														| WidgetSetting.MultiSection['type']
													)[]
												).map(type => {
													return {
														label: SETTINGS_LABELS.get(type)!,
														value: type,
														disabled: setting.type === type,
													};
												})}
												onPromote={() => {}}
												onDelete={() => {}}
											>
												{sectionSettings.map(
													(
														[sectionedSettingId, sectionedSetting],
														sectionedSettingIndex,
													) => {
														return (
															<SettingEditor
																key={sectionedSettingId}
																id={sectionedSettingId}
																setting={sectionedSetting}
																onEdit={() => {
																	openDialog(
																		'Edit Setting',
																		<SetWidgetSettingDialog
																			id={sectionedSettingId}
																			label={i18nStringTransform(
																				sectionedSetting.label,
																			)}
																			condition={sectionedSetting.condition}
																			searchTags={sectionedSetting.searchTags}
																			data={sectionedSetting}
																			checkIdExists={checkIdExists}
																			onSaveSetting={() => {}}
																		/>,
																	);
																}}
																onMoveUp={
																	sectionedSettingIndex === 0
																		? undefined
																		: () => {}
																}
																onMoveDown={
																	sectionedSettingIndex ===
																	sectionSettings.length - 1
																		? undefined
																		: () => {}
																}
																onMoveTo={() => {}}
																moveToOptions={groupOptions.map(option => {
																	// disable option if setting is already in this section
																	return option.value === settingId
																		? { ...option, disabled: true }
																		: option;
																})}
																onDuplicate={() => {}}
																onDelete={() => {}}
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
												setting={setting}
												onEdit={() => {
													openDialog(
														'Edit Setting',
														<SetWidgetSettingDialog
															id={settingId}
															label={i18nStringTransform(setting.label)}
															condition={setting.condition}
															searchTags={setting.searchTags}
															data={setting}
															checkIdExists={checkIdExists}
															onSaveSetting={() => {}}
														/>,
													);
												}}
												onMoveUp={settingIndex === 0 ? undefined : () => {}}
												onMoveDown={
													settingIndex === categorySettings.length - 1
														? undefined
														: () => {}
												}
												onMoveTo={() => {}}
												moveToOptions={groupOptions.map(option => {
													// disable option if setting is already directly in this category
													return option.value === categoryId
														? { ...option, disabled: true }
														: option;
												})}
												onDuplicate={() => {}}
												onDelete={() => {}}
											/>
										);
									}
								})}
							</CategoryEditor>
						);
					})}
				</div>
			</div>
		</section>
	);
}
