declare var slime2: {
	getPronouns: (
		platform: 'twitch',
		userId: string,
		username: string,
	) => Promise<string[] | null>;
	getTwitchFollowDate: (
		accountId: string,
		userId: string,
	) => Promise<string | null>;
	widgetId: string | null;
};
