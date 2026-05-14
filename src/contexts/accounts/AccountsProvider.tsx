import {
	type Account,
	type Accounts,
	deleteTokens,
	loadAccounts,
} from '@/helpers/json/accounts';
import twitchApi from '@/helpers/services/twitch/twitchApi';
import { useEffect, useReducer } from 'react';
import { AccountsContext } from './useAccounts';
import {
	AccountsDispatchContext,
	accountsReducer,
} from './useAccountsDispatch';

export default function AccountsProvider({ children }: Props.WithChildren) {
	const [accounts, dispatch] = useReducer(accountsReducer, {});

	function setAccounts(accounts: Accounts) {
		dispatch({ type: 'set', accounts });
	}

	function updateAccount(account: Account) {
		dispatch({ type: 'add', account });
	}

	useEffect(() => {
		async function getAccounts() {
			const accounts = await loadAccounts();
			setAccounts(accounts);
		}

		getAccounts();
	}, []);

	useEffect(() => {
		Promise.all(
			Object.values(accounts).map(async account => {
				if (account.reauthorize) return;

				if (account.service === 'twitch') {
					try {
						// update user details
						const response = await twitchApi.getUser(
							account.id,
							account.serviceId,
						);
						const user = response.data.data[0];
						if (!user) throw new Error('Twitch user not found while updating!');

						if (
							account.username !== user.login ||
							account.displayName !== user.display_name ||
							account.image !== user.profile_image_url
						) {
							updateAccount({
								...account,
								username: user.login,
								displayName: user.display_name,
								image: user.profile_image_url,
							});
						}
					} catch {
						// unable to get user details
						// delete tokens and set account to need reauthorization
						updateAccount({
							...account,
							reauthorize: true,
						});

						try {
							deleteTokens(account.id);
						} catch (error) {
							console.error(error);
						}

						return;
					}
				}
			}),
		);
	}, [accounts]);

	return (
		<AccountsContext value={accounts}>
			<AccountsDispatchContext value={dispatch}>
				{children}
			</AccountsDispatchContext>
		</AccountsContext>
	);
}
