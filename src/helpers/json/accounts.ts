// functions

import { z } from 'zod';
import {
	deleteSecretKey,
	getSecretKey,
	loadJson,
	setSecretKey,
} from '../commands';
import { mainConfigPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

export async function loadAccounts(): Promise<Accounts> {
	const path = await accountsPath();
	const accounts = await Accounts.parseAsync(await loadJson(path)).catch(
		// fallback to empty
		(): Accounts => ({}),
	);
	return accounts;
}

export async function saveAccounts(accounts: Accounts): Promise<void> {
	queueSaveJson(accounts, await accountsPath());
}

export function getAccountKey(account: Account) {
	return `${account.service}_${account.type}_${account.id}`;
}

export async function getTokens(account: Account): Promise<Tokens | null> {
	try {
		const secret = await getSecretKey(getAccountKey(account));
		const tokens = JSON.parse(secret);
		return Tokens.parse(tokens);
	} catch (error) {
		console.error(error);
		return null;
	}
}

export async function setTokens(
	account: Account,
	accessToken: string,
	refreshToken: string,
): Promise<void> {
	const secret = JSON.stringify({ accessToken, refreshToken });
	await setSecretKey(getAccountKey(account), secret);
}

export async function deleteTokens(account: Account) {
	await deleteSecretKey(getAccountKey(account));
}

async function accountsPath() {
	return mainConfigPath('accounts');
}

// zod and types

const Account = z.object({
	id: z.string(),
	service: z.string(), // "twitch"
	username: z.string(),
	displayName: z.string(),
	image: z.string(),
	scopes: z.array(z.string()),
	type: z.string(), // "read", "bot", "mod"
	reauthorize: z.boolean(),
	widgets: z.array(z.string()),
});
export type Account = z.infer<typeof Account>;

const Accounts = z.record(z.string(), Account);
export type Accounts = z.infer<typeof Accounts>;

const Tokens = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
});
export type Tokens = z.infer<typeof Tokens>;
