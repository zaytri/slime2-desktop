import { Accounts } from '@/helpers/json/accounts';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export const AccountsContext = createContext<Accounts | undefined>(undefined);

export default function useAccounts(): Accounts {
	const context = useContext(AccountsContext);

	if (!context) {
		throw new Error(contextErrorMessage('useAccounts', 'AccountContext'));
	}

	return context;
}
