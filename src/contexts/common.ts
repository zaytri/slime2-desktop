/**
 * Only works with objects that are completely JSON-serializable!
 */
export function deepCopyObject<T>(object: T): T {
	return JSON.parse(JSON.stringify(object));
}

export function contextErrorMessage(functionName: string, contextName: string) {
	return `${functionName} was used outside of a ${contextName} provider!`;
}
