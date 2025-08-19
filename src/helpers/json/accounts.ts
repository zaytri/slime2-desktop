// functions

import { z } from 'zod/mini';
import {
	deleteSecretKey,
	getSecretKey,
	loadJson,
	setSecretKey,
} from '../commands';
import logZodError from '../zodError';
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

export async function getTokens(accountId: string): Promise<Tokens> {
	try {
		const secret = await getSecretKey(accountId);
		const tokens = JSON.parse(secret);
		return Tokens.parse(tokens);
	} catch (error) {
		logZodError(error);
		throw error;
	}
}

export async function setTokens(
	accountId: string,
	accessToken: string,
	refreshToken: string,
): Promise<Tokens> {
	const tokens: Tokens = {
		accessToken,
		refreshToken,
		validatedAt: Date.now(),
	};
	await setSecretKey(accountId, JSON.stringify(tokens));
	return tokens;
}

export async function deleteTokens(accountId: string) {
	await deleteSecretKey(accountId);
}

async function accountsPath() {
	return mainConfigPath('accounts');
}

// zod and types

const Account = z.object({
	id: z.string(),
	serviceId: z.string(),
	service: z.union([z.literal('twitch'), z.literal('youtube')]),
	username: z.string(),
	displayName: z.string(),
	image: z.string(),
	scopes: z.array(z.string()),
	type: z.union([z.literal('read'), z.literal('bot'), z.literal('mod')]),
	reauthorize: z.boolean(),
	// keys are widget IDs, values are indices
	widgets: z.catch(z.record(z.string(), z.number().check(z.nonnegative())), {}),
	default: z.boolean(),
});
export type Account = z.infer<typeof Account>;

const Accounts = z.record(z.string(), Account);
export type Accounts = z.infer<typeof Accounts>;

const Tokens = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	validatedAt: z.number(),
});
export type Tokens = z.infer<typeof Tokens>;
