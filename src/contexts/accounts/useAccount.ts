import { Account, getTokens, setTokens, Tokens } from '@/helpers/json/accounts';
import useAccounts from './useAccounts';
import { useAccountsDispatch } from './useAccountsDispatch';

export function useAccount(id: string): {
	account: Account;
	setAccount: (account: Account) => void;
	setAccountTokens: (
		accessToken: string,
		refreshToken: string,
	) => Promise<void>;
	getAccountTokens: () => Promise<Tokens | null>;
} {
	const accounts = useAccounts();
	const account = accounts[id];
	const { addAccount: set } = useAccountsDispatch();

	return {
		account,
		setAccount: set,
		setAccountTokens: async (accessToken: string, refreshToken: string) =>
			setTokens(account.id, accessToken, refreshToken),
		getAccountTokens: async () => getTokens(account.id),
	};
}
