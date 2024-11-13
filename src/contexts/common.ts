export function emptyFunction() {}

/**
 * Only works with objects that are completely JSON-serializable!
 */
export function deepCopyObject<T>(object: T): T {
	return JSON.parse(JSON.stringify(object));
}
