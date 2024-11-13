import { appConfigDir, appDataDir } from '@tauri-apps/api/path';
import { saveJson } from '../commands';

const queueSaves = new Map<string, () => void>();
const queueCooldowns = new Map<string, Date>();
const COOLDOWN_AMOUNT = 10 * 1000; // 10 seconds

// saves once every COOLDOWN_AMOUNT at most, queueing overridable saves
export function queueSaveJson(jsonObject: unknown, filePath: string) {
	const saveFunction = () => saveJson(jsonObject, filePath);
	const cooldown = queueCooldowns.get(filePath);

	// if within the cooldown, set the function to be queued,
	// replacing any existing queued function
	if (cooldown && cooldown.getTime() > Date.now()) {
		queueSaves.set(filePath, saveFunction);
	} else {
		// set new cooldown of 1 minute
		queueCooldowns.set(filePath, new Date(Date.now() + COOLDOWN_AMOUNT));

		if (runQueuedSave(filePath)) {
			// queued function exists and was run, queue new function
			queueSaves.set(filePath, saveFunction);
		} else {
			// nothing in queue, run the function
			saveFunction();
		}

		// after 1 minute passes, run the function in the queue if it exists
		setTimeout(() => {
			runQueuedSave(filePath);
		}, COOLDOWN_AMOUNT);
	}
}

// fileName must not include ".json" extension
export async function configFilePath(fileName: string) {
	const appConfigDirPath = await appConfigDir();
	return `${appConfigDirPath}/config/${fileName}`;
}

export async function tileFolderPath(id: string) {
	const appDataDirPath = await appDataDir();
	return `${appDataDirPath}/tiles/${id}`;
}

// run function from queue if it exists, and clear the queue
// returns true if there is a queued function
function runQueuedSave(filePath: string) {
	const queuedFunction = queueSaves.get(filePath);
	if (queuedFunction) {
		queuedFunction();
		queueSaves.delete(filePath);
	}
	return !!queuedFunction;
}
