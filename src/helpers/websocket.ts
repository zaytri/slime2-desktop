import { deepCopyObject } from '@/contexts/common';
import { sendWebsocketMessage } from './commands';
import { WidgetSetting, WidgetSettings } from './json/widgetSettings';
import { WidgetValues } from './json/widgetValues';

export async function sendWidgetValues(
	widgetId: string,
	settings: WidgetSettings,
	values: WidgetValues,
) {
	return sendWidgetMessage(
		widgetId,
		'widget-values',
		mergeDefaultValues(settings, values),
	);
}

async function sendWidgetMessage(
	widgetId: string,
	type: string,
	data: unknown,
) {
	return sendWebsocketMessage(
		JSON.stringify({
			type,
			data,
		}),
		`widget_${widgetId}`,
	);
}

export async function sendSharedMessage(channel: string, message: string) {
	return sendWebsocketMessage(message, `channel_${channel}`);
}

function mergeDefaultValues(
	settings: WidgetSettings,
	widgetValues: WidgetValues,
): WidgetValues {
	const mergedValues: WidgetValues = deepCopyObject(widgetValues);

	Object.values(settings).forEach(category => {
		Object.entries(category.settings).forEach(([settingId, setting]) => {
			if (setting.type === 'multi-section') {
				const subsections = mergedValues[settingId];

				if (
					Array.isArray(subsections) &&
					subsections.every(subsection => typeof subsection === 'string')
				) {
					subsections.forEach(subsectionId => {
						Object.entries(setting.settings).forEach(
							([subsettingId, subsetting]) => {
								const fullSubsettingId = `${subsectionId}.${subsettingId}`;

								mergeValue(fullSubsettingId, subsetting, mergedValues);
							},
						);
					});
				} else {
					mergedValues[settingId] = [];
				}
			} else if (setting.type === 'section') {
				Object.entries(setting.settings).forEach(
					([subsettingId, subsetting]) => {
						mergeValue(subsettingId, subsetting, mergedValues);
					},
				);
			} else {
				mergeValue(settingId, setting, mergedValues);
			}
		});
	});

	return mergedValues;
}

function mergeValue(
	settingId: string,
	setting: Exclude<
		WidgetSetting.NonCategory,
		{ type: 'section' | 'multi-section' }
	>,
	values: WidgetValues,
) {
	if (
		setting.type !== 'button' &&
		setting.type !== 'text-display' &&
		setting.type !== 'image-display' &&
		values[settingId] === undefined
	) {
		values[settingId] = setting.defaultValue;
	}
}
