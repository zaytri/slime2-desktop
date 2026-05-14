import {
	type Account,
	type Accounts,
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
			type: 'set-default';
			accountId: string;
			accountType: Account['type'];
			accountService: Account['service'];
	  }
	| {
			type: 'remove';
			id: string;
	  }
	| {
			type: 'slot';
			accountId: string;
			widgetId: string;
			slotIndex: number;
	  }
	| {
			type: 'copy-widget-accounts';
			sourceWidgetId: string;
			destinationWidgetId: string;
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

	const setDefaultAccount = (
		accountId: string,
		accountService: Account['service'],
		accountType: Account['type'],
	) => {
		dispatch({ type: 'set-default', accountId, accountService, accountType });
	};

	const slotAccount = (
		accountId: string,
		widgetId: string,
		slotIndex: number,
	) => {
		dispatch({ type: 'slot', accountId, widgetId, slotIndex });
	};

	const copyWidgetAccounts = (
		sourceWidgetId: string,
		destinationWidgetId: string,
	) => {
		dispatch({
			type: 'copy-widget-accounts',
			sourceWidgetId,
			destinationWidgetId,
		});
	};

	return {
		addAccount,
		removeAccount,
		setDefaultAccount,
		slotAccount,
		copyWidgetAccounts,
	};
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
		case 'set-default': {
			const { accountId, accountService, accountType } = action;

			Object.values(newState).forEach(account => {
				if (account.id === accountId) {
					// set default account
					newState[account.id]!.default = true;
				} else if (
					accountService === account.service &&
					accountType === account.type
				) {
					// remove default from other related accounts
					newState[account.id]!.default = false;
				}
			});

			break;
		}
		case 'remove': {
			const account = newState[action.id];

			if (account) deleteTokens(account.id);

			delete newState[action.id];
			break;
		}
		case 'slot': {
			const { slotIndex, accountId, widgetId } = action;

			Object.values(newState).forEach(account => {
				if (account.id === accountId) {
					// add account to slot
					newState[account.id]!.widgets[widgetId] = slotIndex;
				} else if (newState[account.id]!.widgets[widgetId] === slotIndex) {
					// remove other accounts from slot
					delete newState[account.id]!.widgets[widgetId];
				}
			});

			break;
		}
		case 'copy-widget-accounts': {
			const { sourceWidgetId, destinationWidgetId } = action;

			Object.values(newState).forEach(account => {
				const sourceSlotIndex: number | undefined =
					newState[account.id]!.widgets[sourceWidgetId];

				if (sourceSlotIndex !== undefined) {
					newState[account.id]!.widgets[destinationWidgetId] = sourceSlotIndex;
				}
			});
		}
	}

	saveAccounts(newState);
	return newState;
}
