declare var slime2: {
	request:
		| ((
				accountId: string,
				requestType: string,
				payload?: Record<string, unknown>,
		  ) => Promise<unknown>)
		| ((
				requestType: string,
				payload?: Record<string, unknown>,
		  ) => Promise<unknown>);
	widgetId: string | null;
};
