import { deepCopyObject } from '@/contexts/common';
import { getWidgetValueChildKey } from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { sendWebsocketMessage } from './commands';
import type { WidgetSetting, WidgetSettings } from './json/widgetSettings';
import type { WidgetValues } from './json/widgetValues';

export async function sendWidgetValues(
	widgetId: string,
	settings: WidgetSettings,
	values: WidgetValues,
) {
	return sendWidgetMessage(
		widgetId,
		'widget-values',
		mergeDefaultValues(settings, values),
		true,
	);
}

export async function sendTwitchEvent(
	accountId: string,
	widgetId: string,
	eventId: string,
	eventType: string,
	eventVersion: string,
	eventTimestamp: string,
	data: unknown,
	mock: boolean = false,
) {
	return sendWidgetMessage(
		widgetId,
		'twitch-event',
		{
			id: eventId,
			type: eventType,
			version: eventVersion,
			account_id: accountId,
			timestamp: eventTimestamp,
			mock,
			data,
		},
		true,
	);
}

export async function sendMockTwitchEvent(
	widgetId: string,
	eventType: Twitch.EventSub.Type,
	eventVersion: string,
	eventTimestamp: string,
	data: unknown,
) {
	const accountId = 'mock_event';
	const eventId = `mock_event_${eventTimestamp}`;

	return sendTwitchEvent(
		accountId,
		widgetId,
		eventId,
		eventType,
		eventVersion,
		eventTimestamp,
		data,
		true,
	);
}

export async function sendWidgetAccounts(widgetId: string, data: unknown) {
	return sendWidgetMessage(
		widgetId,
		'widget-accounts',
		{ accounts: data },
		true,
	);
}

export async function sendWidgetResponse(
	widgetId: string,
	type: string,
	requestId: string,
	data: unknown,
) {
	return sendWidgetMessage(
		widgetId,
		'widget-response',
		{
			type,
			request_id: requestId,
			response: data,
		},
		true,
	);
}

export async function sendWidgetCoreChange(widgetId: string) {
	return sendWidgetMessage(widgetId, 'widget-core-change', null, true);
}

export async function sendWidgetButtonClick(
	widgetId: string,
	buttonId: string,
) {
	return sendWidgetMessage(
		widgetId,
		'widget-button-click',
		{ id: buttonId },
		true,
	);
}

async function sendWidgetMessage(
	widgetId: string,
	type: string,
	data?: unknown,
	dispatchToBot: boolean = false,
) {
	if (dispatchToBot) {
		dispatchEvent(
			new CustomEvent(type, {
				detail: { widgetId, data },
			}),
		);
	}

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
								const fullSubsettingId = getWidgetValueChildKey(
									subsectionId,
									subsettingId,
								);

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
		setting.type === 'multi-text-input' ||
		setting.type === 'multi-audio-input' ||
		setting.type === 'multi-image-input' ||
		setting.type === 'multi-select-input' ||
		setting.type === 'multi-video-input'
	) {
		values[settingId] = values[settingId] ?? setting.defaultValue ?? [];
	} else if (
		setting.type !== 'button' &&
		setting.type !== 'text-display' &&
		setting.type !== 'image-display'
	) {
		values[settingId] = values[settingId] ?? setting.defaultValue ?? null;
	}

	// handle volume subvalue for audio and video
	if (setting.type === 'audio-input' || setting.type === 'video-input') {
		const volumeId = getWidgetValueChildKey(settingId, 'volume');
		if (values[volumeId] === undefined) {
			values[volumeId] = 20; // default volume to 20
		}
	}
}
