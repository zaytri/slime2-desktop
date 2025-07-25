import { z } from 'zod/v4-mini';
import { loadJson } from '../commands';
import logZodError from '../zodError';
import { tileFolderPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

// functions

export async function loadWidgetValues(id: string): Promise<WidgetValues> {
	try {
		const json = await loadJson(await widgetValuesPath(id));
		return WidgetValues.parse(json);
	} catch (error) {
		logZodError(error);
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

const WidgetValue = z.union([
	// JSON values, plus undefined just in case
	z.string(),
	z.number(),
	z.boolean(),
	z.null(),
	z.undefined(),
	// no arrays should allow null or undefined
	z.array(z.union([z.boolean(), z.string(), z.number()])),
]);
export type WidgetValue = z.infer<typeof WidgetValue>;

const WidgetValues = z.record(z.string(), WidgetValue);
export type WidgetValues = z.infer<typeof WidgetValues>;
