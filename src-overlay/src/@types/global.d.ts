declare var slime2: {
	request: (
		accountId: string,
		requestType: string,
		payload?: unknown,
	) => Promise<unknown>;
	widgetId: string | null;
};
