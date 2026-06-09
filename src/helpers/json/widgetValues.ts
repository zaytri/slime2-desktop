import { z } from 'zod/mini';
import { loadJson, moveLegacyMediaToGallery } from '../commands';
import {
	createWidgetMediaGalleryValue,
	LEGACY_LOCAL_MEDIA_PREFIX,
} from '../media';
import logZodError from '../zodError';
import { tileFolderPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

// consts

export const DEFAULT_VOLUME = 0.2;

// functions

export async function loadWidgetValues(id: string): Promise<WidgetValues> {
	try {
		const json = await loadJson(await widgetValuesPath(id));

		try {
			const widgetValues = WidgetValuesZ.parse(json);

			// retroactively move all legacy media to shared media folder
			await Promise.all(
				Object.entries(widgetValues).map(async ([key, value]) => {
					if (
						typeof value === 'string' &&
						value.startsWith(LEGACY_LOCAL_MEDIA_PREFIX)
					) {
						// move legacy media to shared media folder
						const [_local, fileName] = value.split(':');
						const newFileName = await moveLegacyMediaToGallery(
							id,
							fileName ?? '',
						);
						widgetValues[key] = createWidgetMediaGalleryValue(newFileName);
					} else if (Array.isArray(value)) {
						const newArrayValue = await Promise.all(
							value.map(async item => {
								if (
									typeof item === 'string' &&
									item.startsWith(LEGACY_LOCAL_MEDIA_PREFIX)
								) {
									// move legacy media to shared media folder
									const [_local, fileName] = item.split(':');
									const newFileName = await moveLegacyMediaToGallery(
										id,
										fileName ?? '',
									);
									return createWidgetMediaGalleryValue(newFileName);
								} else {
									return item;
								}
							}),
						);
						widgetValues[key] = newArrayValue;
					}
				}),
			);
			return widgetValues;
		} catch (error) {
			logZodError(error, json);
			return {};
		}
	} catch (error) {
		console.error(error);
		return {};
	}
}

export async function saveWidgetValues(
	id: string,
	values: WidgetValues,
): Promise<void> {
	queueSaveJson(values, await widgetValuesPath(id));
}

async function widgetValuesPath(id: string) {
	const folderPath = await tileFolderPath(id);
	return `${folderPath}/config/values`;
}

// zod and types

const WidgetValueZ = z.union([
	// JSON values, plus undefined just in case
	z.string(),
	z.number(),
	z.boolean(),
	z.null(),
	z.undefined(),
	// no arrays should allow null or undefined
	z.array(z.union([z.boolean(), z.string(), z.number()])),
]);
export type WidgetValue = z.infer<typeof WidgetValueZ>;

export const WidgetValuesZ = z.record(z.string(), WidgetValueZ);
export type WidgetValues = z.infer<typeof WidgetValuesZ>;
