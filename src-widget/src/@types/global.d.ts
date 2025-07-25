declare var slime2: {
	getPronouns: (
		platform: 'twitch',
		userId: string,
		username: string,
	) => Promise<string[] | null>;
};
