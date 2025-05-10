import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import { loadJson } from '../commands';
import { tileFolderPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

// functions

export async function loadWidgetValues(id: string): Promise<WidgetValues> {
	const path = await widgetValuesPath(id);
	const values = await WidgetValues.parseAsync(await loadJson(path)).catch(
		error => {
			const validationError = fromError(error);
			console.error(validationError.toString());
			return {};
		},
	);

	return values;
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

const WidgetValues = z.record(WidgetValue);
export type WidgetValues = z.infer<typeof WidgetValues>;
