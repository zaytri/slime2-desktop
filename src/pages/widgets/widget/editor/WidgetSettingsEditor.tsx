import CategoryEditor from '@/components/widget_editor/CategoryEditor';
import SectionEditor from '@/components/widget_editor/SectionEditor';
import SettingEditor from '@/components/widget_editor/SettingEditor';
import { deepCopyObject } from '@/contexts/common';
import { useDialog } from '@/contexts/dialog/useDialog';
import { swapItems } from '@/helpers/array';
import { i18nStringTransform } from '@/helpers/i18n';
import GenericErrorDialog from '@@/dialog/GenericErrorDialog';
import SetWidgetSettingDialog from '@@/dialog/SetWidgetSettingDialog';
import {
	AVAILABLE_SETTINGS_GROUPED,
	AVAILABLE_SETTINGS_GROUPED_WITH_SECTION,
	SETTINGS_LABELS,
	type WidgetSetting,
	type WidgetSettings,
} from '@@/json/widgetSettings';
import CheckSvg from '@@/svg/CheckSvg';
import PlusSvg from '@@/svg/PlusSvg';
import XSvg from '@@/svg/XSvg';
import { Checkbox } from '@ariakit/react';
import { useState } from 'react';

type WidgetSettingsEditorProps = {
	value: WidgetSettings;
	onChange: (settings: WidgetSettings) => void;
};

export default function WidgetSettingsEditor({
	value,
	onChange,
}: WidgetSettingsEditorProps) {
	const { openDialog } = useDialog();
	const [showDetails, setShowDetails] = useState(true);
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

	function onMoveSettingToGroup(
		setting: WidgetSetting.NonCategory,
		settingId: string,
		oldGroupId: string,
		newGroupId: string,
	) {
		const newValue = deepCopyObject(value);
		const newSetting = deepCopyObject(setting);

		categories.forEach(([newCategoryId, category]) => {
			if (!newValue[newCategoryId]) return;

			// insert setting into new group
			if (newCategoryId === newGroupId) {
				newValue[newCategoryId].settings[settingId] = newSetting;
			}

			// remove setting from original group
			if (newCategoryId === oldGroupId) {
				delete newValue[newCategoryId].settings[settingId];
			}

			// sections cannot be moved into other sections
			if (
				newSetting.type === 'section' ||
				newSetting.type === 'multi-section'
			) {
				return;
			}

			Object.entries(category.settings).forEach(([newSectionId]) => {
				if (
					!newValue[newCategoryId]?.settings[newSectionId] ||
					!('settings' in newValue[newCategoryId].settings[newSectionId])
				) {
					return;
				}

				// insert setting into new subgroup
				if (newSectionId === newGroupId) {
					newValue[newCategoryId].settings[newSectionId].settings[settingId] =
						newSetting;
				}

				// remove setting from original subgroup
				if (newSectionId === oldGroupId) {
					delete newValue[newCategoryId].settings[newSectionId].settings[
						settingId
					];
				}
			});
		});

		onChange(newValue);
	}

	return (
		<section className='flex flex-2 flex-col gap-2'>
			<div className='flex items-end gap-2'>
				<h2 className='flex-1 px-3 font-mochiy text-4.5 text-white text-shadow-[0_1px_black]'>
					Widget Settings
				</h2>

				<label>
					<Checkbox
						render={<button />}
						checked={showDetails}
						onChange={() => {
							setShowDetails(!showDetails);
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

				<button
					type='button'
					className='flex items-center gap-2 rounded-1 px-2 font-fredoka font-medium text-white *:drop-shadow-[0_1px_black] over:outline-2 over:outline-offset-1! over:outline-white'
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

						function onEditCategory() {
							openDialog(
								'Edit Category',
								<SetWidgetSettingDialog
									id={categoryId}
									label={categoryLabel}
									checkIdExists={checkIdExists}
									onSaveCategory={() => {}}
								/>,
							);
						}

						function onMoveCategory(oldIndex: number, newIndex: number) {
							const newEntries = swapItems(categories, oldIndex, newIndex);

							const newValue: WidgetSettings = newEntries.reduce(
								(settings, [categoryId, category]) => {
									return { ...settings, [categoryId]: category };
								},
								{},
							);

							onChange(newValue);
						}

						return (
							<CategoryEditor
								key={categoryId}
								id={categoryId}
								label={categoryLabel}
								onEdit={onEditCategory}
								onMoveUp={
									categoryIndex === 0
										? undefined
										: () => {
												onMoveCategory(categoryIndex, categoryIndex - 1);
											}
								}
								onMoveDown={
									categoryIndex === categories.length - 1
										? undefined
										: () => {
												onMoveCategory(categoryIndex, categoryIndex + 1);
											}
								}
								onAdd={type => {}}
								addOptions={AVAILABLE_SETTINGS_GROUPED_WITH_SECTION}
								onDemote={(type, newCategoryId) => {
									const noSections = categorySettings.every(([_, setting]) => {
										return (
											setting.type !== 'section' &&
											setting.type !== 'multi-section'
										);
									});

									if (!noSections) {
										openDialog(
											"Can't Convert Category!",
											<GenericErrorDialog>
												This category contains some <strong>Sections</strong> or{' '}
												<strong>Multi-Sections</strong>. It cannot be converted
												until those are removed.
											</GenericErrorDialog>,
										);
										return;
									}

									const newValue = deepCopyObject(value);
									const newSection = deepCopyObject(category);

									if (!newValue[newCategoryId]) return;

									// add type to create new section
									newValue[newCategoryId].settings[categoryId] = {
										...newSection,
										type,
									} as WidgetSetting.Section | WidgetSetting.MultiSection;

									// remove original category
									delete newValue[categoryId];

									onChange(newValue);
								}}
								demoteOptions={categoryOptions.map(option => {
									// disable option if category is this category
									return { ...option, disabled: option.value === categoryId };
								})}
								onDelete={() => {}}
							>
								{categorySettings.map(([settingId, setting], settingIndex) => {
									function onEditSetting(dialogTitle: string) {
										openDialog(
											dialogTitle,
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
									}

									function onMoveSetting(oldIndex: number, newIndex: number) {
										const newCategorySettings = swapItems(
											categorySettings,
											oldIndex,
											newIndex,
										);

										const newValue = deepCopyObject(value);

										if (newValue[categoryId]?.settings) {
											newValue[categoryId].settings =
												newCategorySettings.reduce(
													(settings, [settingId, setting]) => {
														return { ...settings, [settingId]: setting };
													},
													{},
												);
										}

										onChange(newValue);
									}

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
													onEditSetting(
														`Edit ${SETTINGS_LABELS.get(setting.type)}`,
													);
												}}
												onMoveUp={
													settingIndex === 0
														? undefined
														: () => {
																onMoveSetting(settingIndex, settingIndex - 1);
															}
												}
												onMoveDown={
													settingIndex === categorySettings.length - 1
														? undefined
														: () => {
																onMoveSetting(settingIndex, settingIndex + 1);
															}
												}
												onMoveTo={(newGroupId: string) => {
													onMoveSettingToGroup(
														setting,
														settingId,
														categoryId,
														newGroupId,
													);
												}}
												moveToOptions={categoryOptions.map(option => {
													// disable option if section is already in this category
													return {
														...option,
														disabled: option.value === categoryId,
													};
												})}
												onAdd={() => {}}
												addOptions={AVAILABLE_SETTINGS_GROUPED}
												onConvert={newType => {
													const newValue = deepCopyObject(value);

													if (
														newValue[categoryId]?.settings[settingId] &&
														'settings' in
															newValue[categoryId].settings[settingId]
													) {
														// exists and is a section
														newValue[categoryId].settings[settingId].type =
															newType;
													}

													onChange(newValue);
												}}
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
												onPromote={() => {
													const newValue = deepCopyObject(value);

													// use label and settings to create new category
													const { label, settings } = deepCopyObject(setting);
													newValue[settingId] = { label, settings };

													// remove original section
													delete newValue[categoryId]?.settings[settingId];

													onChange(newValue);
												}}
												onDelete={() => {}}
											>
												{sectionSettings.map(
													([subSettingId, subSetting], subSettingIndex) => {
														function onEditSubSetting() {
															openDialog(
																'Edit Setting',
																<SetWidgetSettingDialog
																	id={subSettingId}
																	label={i18nStringTransform(subSetting.label)}
																	condition={subSetting.condition}
																	searchTags={subSetting.searchTags}
																	data={subSetting}
																	checkIdExists={checkIdExists}
																	onSaveSetting={() => {}}
																/>,
															);
														}

														function onMoveSubSetting(
															oldIndex: number,
															newIndex: number,
														) {
															const newSectionSettings = swapItems(
																sectionSettings,
																oldIndex,
																newIndex,
															);

															const newValue = deepCopyObject(value);
															if (
																newValue[categoryId]?.settings[settingId] &&
																'settings' in
																	newValue[categoryId].settings[settingId]
															) {
																newValue[categoryId].settings[
																	settingId
																].settings = newSectionSettings.reduce(
																	(
																		sectionSettings,
																		[subSettingId, subSetting],
																	) => {
																		return {
																			...sectionSettings,
																			[subSettingId]: subSetting,
																		};
																	},
																	{},
																);
															}

															onChange(newValue);
														}

														return (
															<SettingEditor
																key={subSettingId}
																id={subSettingId}
																setting={subSetting}
																showDetails={showDetails}
																onEdit={onEditSubSetting}
																onMoveUp={
																	subSettingIndex === 0
																		? undefined
																		: () => {
																				onMoveSubSetting(
																					subSettingIndex,
																					subSettingIndex - 1,
																				);
																			}
																}
																onMoveDown={
																	subSettingIndex === sectionSettings.length - 1
																		? undefined
																		: () => {
																				onMoveSubSetting(
																					subSettingIndex,
																					subSettingIndex + 1,
																				);
																			}
																}
																onMoveTo={newGroupId => {
																	onMoveSettingToGroup(
																		subSetting,
																		subSettingId,
																		settingId,
																		newGroupId,
																	);
																}}
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
												showDetails={showDetails}
												onEdit={() => {
													onEditSetting('Edit Setting');
												}}
												onMoveUp={
													settingIndex === 0
														? undefined
														: () => {
																onMoveSetting(settingIndex, settingIndex - 1);
															}
												}
												onMoveDown={
													settingIndex === categorySettings.length - 1
														? undefined
														: () => {
																onMoveSetting(settingIndex, settingIndex + 1);
															}
												}
												onMoveTo={newGroupId => {
													onMoveSettingToGroup(
														setting,
														settingId,
														categoryId,
														newGroupId,
													);
												}}
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
