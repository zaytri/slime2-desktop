import {
	Account,
	Accounts,
	deleteTokens,
	saveAccounts,
} from '@/helpers/json/accounts';
import { createContext, useContext } from 'react';
import { contextErrorMessage, deepCopyObject } from '../common';

type AccountsAction =
	| {
			type: 'add';
			account: Account;
	  }
	| {
			type: 'set';
			accounts: Accounts;
	  }
	| {
			type: 'remove';
			id: string;
	  };

export const AccountsDispatchContext = createContext<
	React.Dispatch<AccountsAction> | undefined
>(undefined);

export function useAccountsDispatch() {
	const dispatch = useContext(AccountsDispatchContext);

	if (!dispatch) {
		throw new Error(
			contextErrorMessage('useAccountsDispatch', 'AccountsDispatchContext'),
		);
	}

	const addAccount = (account: Account) => {
		dispatch({ type: 'add', account });
	};

	const removeAccount = (id: string) => {
		dispatch({ type: 'remove', id });
	};

	return { addAccount, removeAccount };
}

export function accountsReducer(
	state: Accounts,
	action: AccountsAction,
): Accounts {
	const newState = deepCopyObject(state);

	switch (action.type) {
		case 'set': {
			return action.accounts;
		}
		case 'add': {
			// deep copy data
			const newAccount: Account = deepCopyObject(action.account);

			// set/update new account value
			newState[newAccount.id] = newAccount;
			break;
		}
		case 'remove': {
			const account = newState[action.id];

			if (account) deleteTokens(account.id);

			delete newState[action.id];
			break;
		}
	}

	saveAccounts(newState);
	return newState;
}
