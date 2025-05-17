import { getAccountKey, loadAccounts } from '@/helpers/json/accounts';
import { memo, useEffect, useReducer, useRef } from 'react';
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

	const accountConnectionsRef = useRef(
		new Map<
			string,
			{
				listener: (data: unknown) => void;
				unlisten: VoidFunction;
				commander: (data: unknown) => unknown;
			}
		>(),
	);

	useEffect(() => {
		Object.values(accounts).forEach(account => {
			if (!accountConnectionsRef.current.has(getAccountKey(account))) {
			}
		});
	}, [accounts]);

	return (
		<AccountsContext value={accounts}>
			<AccountsDispatchContext value={dispatch}>
				{children}
			</AccountsDispatchContext>
		</AccountsContext>
	);
});

export default AccountsProvider;
