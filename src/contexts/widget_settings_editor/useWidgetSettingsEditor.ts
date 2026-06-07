import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSetting, WidgetSettings } from '@@/json/widgetSettings';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export default function useWidgetSettingsEditor() {
	const context = useContext(WidgetSettingsEditorContext);

	if (!context) {
		throw new Error(
			contextErrorMessage(
				'useWidgetSettingsEditor',
				'WidgetSettingsEditorContext',
			),
		);
	}

	const getCategory = (categoryId: string) => {
		return context[categoryId];
	};

	const getSetting = (
		settingId: string,
		categoryId: string,
		sectionId?: string,
	) => {
		if (sectionId) {
			if (
				context[categoryId]?.settings[sectionId] &&
				'settings' in context[categoryId].settings[sectionId]
			) {
				return context[categoryId].settings[sectionId].settings[settingId];
			} else {
				return undefined;
			}
		} else {
			return context[categoryId]?.settings[settingId];
		}
	};

	// collect all existing ids for checking id collision
	const everyId = new Set<string>();

	// collect all categories for menu
	const categoryOptions: Option<string>[] = [];

	// collect all groups for menu
	const groupOptions: Option<{
		id: string;
		type: WidgetSetting.AnySection['type'] | 'category';
	}>[] = [];

	Object.entries(context).forEach(([categoryId, category]) => {
		everyId.add(categoryId);

		const categoryLabel = i18nStringTransform(category.label);
		categoryOptions.push({ label: categoryLabel, value: categoryId });
		groupOptions.push({
			label: categoryLabel,
			value: {
				id: categoryId,
				type: 'category',
			},
		});

		Object.entries(category.settings).forEach(([settingId, setting]) => {
			everyId.add(settingId);

			if (setting.type === 'section' || setting.type === 'multi-section') {
				groupOptions.push({
					label: i18nStringTransform(setting.label),
					value: { id: settingId, type: setting.type },
				});

				Object.keys(setting.settings).forEach(subSettingId => {
					everyId.add(subSettingId);
				});
			}
		});
	});

	const idExists = (id: string) => {
		return everyId.has(id);
	};

	const getConditionIds = (categoryId: string, sectionId?: string) => {
		const group = sectionId
			? getSetting(sectionId, categoryId)
			: getCategory(categoryId);
		if (group && 'settings' in group) {
			return Object.keys(group.settings);
		} else {
			return [];
		}
	};

	const getPreviewIds = (categoryId: string, multiSectionId: string) => {
		const group = getSetting(multiSectionId, categoryId);
		if (group && group.type === 'multi-section') {
			return Object.entries(group.settings)
				.filter(([_settingId, setting]) => {
					return (
						setting.type === 'text-input' ||
						setting.type === 'text-area-input' ||
						setting.type === 'toggle-input' ||
						setting.type === 'number-input' ||
						setting.type === 'slider-input' ||
						setting.type === 'color-input' ||
						setting.type === 'font-input' ||
						setting.type === 'dropdown-input' ||
						setting.type === 'select-input' ||
						setting.type === 'multi-text-input' ||
						setting.type === 'multi-select-input'
					);
				})
				.map(([settingId]) => {
					return settingId;
				});
		} else {
			return [];
		}
	};

	return {
		settings: context,
		getCategory,
		getSetting,
		getConditionIds,
		getPreviewIds,
		idExists,
		categoryOptions,
		groupOptions,
	};
}

export const WidgetSettingsEditorContext = createContext<
	WidgetSettings | undefined
>(undefined);
