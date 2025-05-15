import { loadAccounts } from '@/helpers/json/accounts';
import { memo, useEffect, useReducer } from 'react';
import { AccountsContext } from './useAccounts';
import {
	AccountsDispatchContext,
	accountsReducer,
} from './useAccountsDispatch';

const AccountsProvider = memo(function AccountsProvider({
	children,
}: Props.WithChildren) {
	const [accounts, dispatch] = useReducer(accountsReducer, {});

	useEffect(() => {
		async function getAccounts() {
			const accounts = await loadAccounts();
			dispatch({ type: 'set', accounts });
		}

		getAccounts();
	}, []);

	return (
		<AccountsContext value={accounts}>
			<AccountsDispatchContext value={dispatch}>
				{children}
			</AccountsDispatchContext>
		</AccountsContext>
	);
});

export default AccountsProvider;
