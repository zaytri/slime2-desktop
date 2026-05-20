export function contextErrorMessage(functionName: string, contextName: string) {
	return `${functionName} was used outside of a ${contextName} provider!`;
}
