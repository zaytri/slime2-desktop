import axios from 'axios';

const alejoPronounsAxios = axios.create({
	baseURL: 'https://api.pronouns.alejo.io/v1',
});

const alejoPronounsApi = {
	async getUser(username: string) {
		const user = await alejoPronounsAxios
			.get<{
				channel_id: string;
				channel_login: string;
				pronoun_id: string;
				alt_pronoun_id: string | null;
			}>(`/users/${username}`)
			.then(response => response.data)
			.catch(() => null);

		if (!user) return null; // user hasn't set pronouns or server is down

		const { pronoun_id, alt_pronoun_id } = user;
		const primary = pronounsDataMap[pronoun_id];
		const secondary = alt_pronoun_id ? pronounsDataMap[alt_pronoun_id] : null;

		const pronouns = !secondary
			? primary.singular
				? [primary.subject]
				: [primary.subject, primary.object]
			: [primary.subject, secondary.object];

		return pronouns.map(pronoun => pronoun.toLowerCase());
	},
};

export default alejoPronounsApi;

// https://api.pronouns.alejo.io/v1/pronouns currently returns as of 6/28/2025
const pronounsDataMap: Record<
	string,
	{
		name: string; // pronouns ID
		subject: string; // for "She/Her", this is "She"
		object: string; // for "She/Her", this is "Her"
		/**
		 * If this is true, and the user has this as their pronoun_id, and has no
		 * alt_pronoun_id, then only display the subject (for example "Any" instead
		 * of "Any/Any")
		 */
		singular: boolean;
	}
> = {
	aeaer: { name: 'aeaer', subject: 'Ae', object: 'Aer', singular: false },
	any: { name: 'any', subject: 'Any', object: 'Any', singular: true },
	eem: { name: 'eem', subject: 'E', object: 'Em', singular: false },
	faefaer: { name: 'faefaer', subject: 'Fae', object: 'Faer', singular: false },
	hehim: { name: 'hehim', subject: 'He', object: 'Him', singular: false },
	itits: { name: 'itits', subject: 'It', object: 'Its', singular: false },
	other: { name: 'other', subject: 'Other', object: 'Other', singular: true },
	perper: { name: 'perper', subject: 'Per', object: 'Per', singular: false },
	sheher: { name: 'sheher', subject: 'She', object: 'Her', singular: false },
	theythem: {
		name: 'theythem',
		subject: 'They',
		object: 'Them',
		singular: false,
	},
	vever: { name: 'vever', subject: 'Ve', object: 'Ver', singular: false },
	xexem: { name: 'xexem', subject: 'Xe', object: 'Xem', singular: false },
	ziehir: { name: 'ziehir', subject: 'Zie', object: 'Hir', singular: false },
};
