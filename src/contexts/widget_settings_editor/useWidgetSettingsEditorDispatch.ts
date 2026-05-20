import { swapItems } from '@/helpers/array';
import type { WidgetSetting, WidgetSettings } from '@@/json/widgetSettings';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export function useWidgetSettingsEditorDispatch() {
	const dispatch = useContext(WidgetSettingsEditorDispatchContext);

	if (!dispatch) {
		throw new Error(
			contextErrorMessage(
				'useWidgetSettingsEditorDispatch',
				'WidgetSettingsEditorDispatchContext',
			),
		);
	}

	const swapIndex = (
		oldIndex: number,
		newIndex: number,
		categoryId?: string,
		sectionId?: string,
	) => {
		dispatch({ type: 'swap-index', oldIndex, newIndex, categoryId, sectionId });
	};

	const moveToGroup = (
		id: string,
		setting: WidgetSetting.NonCategory,
		oldGroupId: string,
		newGroupId: string,
	) => {
		dispatch({ type: 'move-to-group', id, setting, oldGroupId, newGroupId });
	};

	const demoteCategory = (
		id: string,
		category: WidgetSetting.Category,
		newCategoryId: string,
		newType: WidgetSetting.AnySection['type'],
	) => {
		dispatch({ type: 'demote-category', id, category, newCategoryId, newType });
	};

	const promoteSection = (
		id: string,
		categoryId: string,
		section: WidgetSetting.AnySection,
	) => {
		dispatch({ type: 'promote-section', id, categoryId, section });
	};

	const editCategory = (id: string, index: number, label: string) => {
		dispatch({ type: 'edit-category', id, index, label });
	};

	const editSection = (
		id: string,
		index: number,
		label: string,
		sectionType: WidgetSetting.AnySection['type'],
		condition: WidgetSetting.Condition,
		searchTags: WidgetSetting.SearchTags,
		categoryId: string,
	) => {
		dispatch({
			type: 'edit-section',
			id,
			index,
			sectionType,
			label,
			condition,
			searchTags,
			categoryId,
		});
	};

	const editSetting = (
		id: string,
		index: number,
		setting: WidgetSetting.NonGroup,
		categoryId: string,
		sectionId?: string,
	) => {
		dispatch({
			type: 'edit-setting',
			id,
			index,
			setting,
			categoryId,
			sectionId,
		});
	};

	const addCategory = (id: string, label: string) => {
		dispatch({ type: 'add-category', id, label });
	};

	const addSetting = (
		id: string,
		setting: WidgetSetting.NonCategory,
		categoryId: string,
		sectionId?: string,
	) => {
		dispatch({ type: 'add-setting', id, setting, categoryId, sectionId });
	};

	const deleteCategory = (id: string) => {
		dispatch({ type: 'delete', id });
	};

	const deleteSetting = (
		id: string,
		categoryId: string,
		sectionId?: string,
	) => {
		dispatch({ type: 'delete', id, categoryId, sectionId });
	};

	return {
		swapIndex,
		moveToGroup,
		demoteCategory,
		promoteSection,
		editCategory,
		editSection,
		editSetting,
		addCategory,
		addSetting,
		deleteCategory,
		deleteSetting,
	};
}

export type WidgetSettingsEditorAction =
	| {
			type: 'swap-index';
			oldIndex: number;
			newIndex: number;
			categoryId?: string;
			sectionId?: string;
	  }
	| {
			type: 'move-to-group';
			id: string;
			setting: WidgetSetting.NonCategory;
			oldGroupId: string;
			newGroupId: string;
	  }
	| {
			type: 'demote-category';
			id: string;
			category: WidgetSetting.Category;
			newCategoryId: string;
			newType: WidgetSetting.AnySection['type'];
	  }
	| {
			type: 'promote-section';
			id: string;
			categoryId: string;
			section: WidgetSetting.AnySection;
	  }
	| {
			type: 'edit-category';
			id: string;
			index: number;
			label: string;
	  }
	| {
			type: 'edit-section';
			id: string;
			index: number;
			label: string;
			condition: WidgetSetting.Condition;
			searchTags: WidgetSetting.SearchTags;
			sectionType: WidgetSetting.AnySection['type'];
			categoryId: string;
	  }
	| {
			type: 'edit-setting';
			id: string;
			index: number;
			categoryId: string;
			sectionId?: string;
			setting: WidgetSetting.NonGroup;
	  }
	| {
			type: 'add-category';
			id: string;
			label: string;
	  }
	| {
			type: 'add-setting';
			id: string;
			setting: WidgetSetting.NonCategory;
			categoryId: string;
			sectionId?: string;
	  }
	| {
			type: 'delete';
			id: string;
			categoryId?: string;
			sectionId?: string;
	  };

export const WidgetSettingsEditorDispatchContext = createContext<
	React.Dispatch<WidgetSettingsEditorAction> | undefined
>(undefined);

export function widgetSettingsEditorReducer(
	state: WidgetSettings,
	action: WidgetSettingsEditorAction,
): WidgetSettings {
	const copiedState = structuredClone(state);

	try {
		switch (action.type) {
			case 'swap-index': {
				const { oldIndex, newIndex, categoryId, sectionId } = action;
				if (oldIndex === newIndex) {
					throw new Error('oldIndex matches newIndex!');
				}

				if (categoryId) {
					if (sectionId) {
						// move section setting
						if (
							!(
								copiedState[categoryId]?.settings[sectionId] &&
								'settings' in copiedState[categoryId].settings[sectionId]
							)
						) {
							throw new Error('Section not found!');
						}

						const newSectionSettingEntries = swapItems(
							Object.entries(
								copiedState[categoryId].settings[sectionId].settings,
							),
							oldIndex,
							newIndex,
						);

						copiedState[categoryId].settings[sectionId].settings =
							newSectionSettingEntries.reduce(
								(newSectionSettings, [subSettingId, subSetting]) => {
									return {
										...newSectionSettings,
										[subSettingId]: structuredClone(subSetting),
									};
								},
								{},
							);

						return copiedState;
					} else {
						// move category setting
						if (!copiedState[categoryId]?.settings) {
							throw new Error('Category not found!');
						}

						const newCategorySettingEntries = swapItems(
							Object.entries(copiedState[categoryId].settings),
							oldIndex,
							newIndex,
						);

						copiedState[categoryId].settings = newCategorySettingEntries.reduce(
							(newCategorySettings, [settingId, setting]) => {
								return {
									...newCategorySettings,
									[settingId]: structuredClone(setting),
								};
							},
							{},
						);

						return copiedState;
					}
				} else {
					// move category
					const newEntries = swapItems(
						Object.entries(copiedState),
						oldIndex,
						newIndex,
					);

					return newEntries.reduce((newState, [categoryId, category]) => {
						return {
							...newState,
							[categoryId]: structuredClone(category),
						};
					}, {});
				}
			}
			case 'move-to-group': {
				const { id, setting, oldGroupId, newGroupId } = action;
				if (oldGroupId === newGroupId) {
					throw new Error('oldGroupId matches newGroupId!');
				}

				let added = false;
				let deleted = false;
				const copiedSetting = structuredClone(setting);

				// iterate through categories
				for (const [categoryId, category] of Object.entries(state)) {
					if (!copiedState[categoryId]) {
						throw new Error('Category not found!');
					}

					if (newGroupId === categoryId) {
						// add setting to new category
						copiedState[categoryId].settings = {
							[id]: copiedSetting,
							...copiedState[categoryId].settings,
						};
						added = true;
					} else if (oldGroupId === categoryId) {
						// remove setting from old category
						delete copiedState[categoryId].settings[id];
						deleted = true;
					}

					if (added && deleted) {
						return copiedState;
					}

					if (
						copiedSetting.type === 'section' ||
						copiedSetting.type === 'multi-section'
					) {
						// sections can only be moved into categories
						continue;
					}

					// iterate through category settings
					for (const categorySettingId of Object.keys(category.settings)) {
						if (!copiedState[categoryId].settings[categorySettingId]) {
							throw new Error('Category setting not found!');
						}

						if (
							!(
								'settings' in
								copiedState[categoryId].settings[categorySettingId]
							)
						) {
							// ignore non section settings
							continue;
						}

						if (newGroupId === categorySettingId) {
							// add setting to new section
							copiedState[categoryId].settings[categorySettingId].settings = {
								[id]: copiedSetting,
								...copiedState[categoryId].settings[categorySettingId].settings,
							};
							added = true;
						} else if (oldGroupId === categorySettingId) {
							// remove setting from old section
							delete copiedState[categoryId].settings[categorySettingId]
								.settings[id];
							deleted = true;
						}

						if (added && deleted) {
							return copiedState;
						}
					}
				}

				if (added && deleted) {
					return copiedState;
				} else {
					throw new Error('Group not found!');
				}
			}
			case 'demote-category': {
				const { id, category, newCategoryId, newType } = action;

				if (!copiedState[newCategoryId]) {
					throw new Error('New category not found!');
				}

				// create new section with new type
				const newSection: WidgetSetting.Section | WidgetSetting.MultiSection = {
					label: category.label,
					type: newType,
					settings: {},
				};

				// copy original category settings into settings of new section
				for (const [settingId, setting] of Object.entries(category.settings)) {
					if (setting.type === 'section' || setting.type === 'multi-section') {
						// cannot demote a category that has sections
						throw new Error('Category contains sections!');
					}

					newSection.settings[settingId] = structuredClone(setting);
				}

				// remove original category
				delete copiedState[id];

				// add new section into new category
				copiedState[newCategoryId].settings = {
					[id]: newSection,
					...copiedState[newCategoryId].settings,
				};

				return copiedState;
			}
			case 'promote-section': {
				const { id, categoryId, section } = action;

				if (!copiedState[categoryId]) {
					throw new Error('Category not found!');
				}

				// create new category using label and settings
				const { label, settings }: WidgetSetting.Category =
					structuredClone(section);

				// remove original section
				delete copiedState[categoryId].settings[id];

				return {
					[id]: { label, settings },
					...copiedState,
				};
			}
			case 'edit-category': {
				const { id, index, label } = action;

				// reconstruct settings with new id at original index
				return Object.entries(copiedState).reduce(
					(newState, [categoryId, category], oldIndex) => {
						const copiedCategory = structuredClone(category);
						return {
							...newState,
							...(index === oldIndex
								? { [id]: { ...copiedCategory, label } }
								: { [categoryId]: copiedCategory }),
						};
					},
					{},
				);
			}
			case 'edit-section': {
				const {
					id,
					index,
					sectionType,
					label,
					condition,
					searchTags,
					categoryId,
				} = action;

				if (!copiedState[categoryId]) {
					throw new Error('Category not found!');
				}

				// reconstruct category settings with new id at original index
				copiedState[categoryId].settings = Object.entries(
					copiedState[categoryId].settings,
				).reduce((newCategorySettings, [settingId, setting], oldIndex) => {
					const copiedSetting = structuredClone(setting);
					return {
						...newCategorySettings,
						...(index === oldIndex
							? {
									[id]: {
										...copiedSetting,
										label,
										condition,
										searchTags,
										type: sectionType,
									},
								}
							: { [settingId]: copiedSetting }),
					};
				}, {});

				return copiedState;
			}
			case 'edit-setting': {
				const { id, index, setting, categoryId, sectionId } = action;

				if (sectionId) {
					if (
						!(
							copiedState[categoryId]?.settings[sectionId] &&
							'settings' in copiedState[categoryId].settings[sectionId]
						)
					) {
						throw new Error('Section not found!');
					}

					// reconstruct section settings with new id at original index
					copiedState[categoryId].settings[sectionId].settings = Object.entries(
						copiedState[categoryId].settings[sectionId].settings,
					).reduce(
						(newSectionSettings, [subSettingId, oldSubSetting], oldIndex) => {
							const copiedSubSetting = structuredClone(oldSubSetting);
							return {
								...newSectionSettings,
								...(index === oldIndex
									? {
											[id]: {
												...copiedSubSetting,
												...structuredClone(setting),
											},
										}
									: { [subSettingId]: copiedSubSetting }),
							};
						},
						{},
					);

					return copiedState;
				} else {
					if (!copiedState[categoryId]) {
						throw new Error('Category not found!');
					}

					// reconstruct category settings with new id at original index
					copiedState[categoryId].settings = Object.entries(
						copiedState[categoryId].settings,
					).reduce((newCategorySettings, [settingId, oldSetting], oldIndex) => {
						const copiedSetting = structuredClone(oldSetting);
						return {
							...newCategorySettings,
							...(index === oldIndex
								? { [id]: { ...copiedSetting, ...structuredClone(setting) } }
								: { [settingId]: copiedSetting }),
						};
					}, {});

					return copiedState;
				}
			}
			case 'add-category': {
				const { id, label } = action;

				if (copiedState[id]) {
					throw new Error('Category already exists!');
				}

				// add new category on top
				return {
					[id]: { label, settings: {} },
					...copiedState,
				};
			}
			case 'add-setting': {
				const { id, categoryId, sectionId, setting } = action;

				if (sectionId) {
					if (setting.type === 'section' || setting.type === 'multi-section') {
						throw new Error('Cannot add section to another section!');
					}

					if (
						!(
							copiedState[categoryId]?.settings[sectionId] &&
							'settings' in copiedState[categoryId].settings[sectionId]
						)
					) {
						throw new Error('Section not found!');
					}

					if (copiedState[categoryId].settings[sectionId].settings[id]) {
						throw new Error('Setting already exists!');
					}

					// add new subsetting on top
					copiedState[categoryId].settings[sectionId].settings = {
						[id]: structuredClone(setting),
						...copiedState[categoryId].settings[sectionId].settings,
					};

					return copiedState;
				} else {
					if (!copiedState[categoryId]) {
						throw new Error('Category not found!');
					}

					if (copiedState[categoryId].settings[id]) {
						throw new Error('Setting already exists!');
					}

					// add new setting on top
					copiedState[categoryId].settings = {
						[id]: structuredClone(setting),
						...copiedState[categoryId].settings,
					};

					return copiedState;
				}
			}
			case 'delete': {
				const { id, categoryId, sectionId } = action;
				if (categoryId) {
					if (sectionId) {
						// delete section setting
						if (
							copiedState[categoryId]?.settings[sectionId] &&
							'settings' in copiedState[categoryId].settings[sectionId]
						) {
							delete copiedState[categoryId].settings[sectionId].settings[id];
							return copiedState;
						} else {
							throw new Error('Section setting not found!');
						}
					}

					// delete category setting
					if (copiedState[categoryId]?.settings[id]) {
						if (
							'settings' in copiedState[categoryId].settings[id] &&
							Object.values(copiedState[categoryId].settings[id].settings)
								.length > 0
						) {
							throw new Error('Section contains settings!');
						} else {
							delete copiedState[categoryId].settings[id];
							return copiedState;
						}
					} else {
						throw new Error('Category setting not found!');
					}
				} else {
					if (copiedState[id]) {
						if (Object.values(copiedState[id].settings).length > 0) {
							throw new Error('Category contains settings!');
						} else {
							delete copiedState[id];
							return copiedState;
						}
					} else {
						throw new Error('Category not found!');
					}
				}
			}

			default:
				return state;
		}
	} catch (error) {
		// encountered error, return original state
		console.error('[widgetSettingsEditorReducer]', error, action, state);
		return state;
	}
}
