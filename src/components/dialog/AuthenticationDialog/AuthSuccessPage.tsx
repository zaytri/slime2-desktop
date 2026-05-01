import AccountPreview from '@/components/AccountPreview';
import ToggleField from '@/components/input_fields/ToggleField';
import { useAccount } from '@/contexts/accounts/useAccount';
import useAccounts from '@/contexts/accounts/useAccounts';
import { useAccountsDispatch } from '@/contexts/accounts/useAccountsDispatch';
import { useDialog } from '@/contexts/dialog/useDialog';
import { usePageContext } from '@/contexts/pages/usePageContext';
import { Account } from '@/helpers/json/accounts';
import { capitalizeWord } from '@/helpers/string';
import { useState } from 'react';
import { AuthenticationContext } from '.';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';

export default function AuthSuccessPage() {
	const { accountId } = usePageContext<AuthenticationContext>();
	const { account, setAccount } = useAccount(accountId);
	const accounts = useAccounts();
	const { setDefaultAccount } = useAccountsDispatch();
	const { closeDialog } = useDialog();

	let otherDefaultAccount: Account | undefined = undefined;

	for (const otherAccount of Object.values(accounts)) {
		if (
			otherAccount.id !== accountId &&
			otherAccount.service === account.service &&
			otherAccount.type === account.type &&
			otherAccount.default
		) {
			otherDefaultAccount = otherAccount;
			break;
		}
	}

	const [defaultChecked, setDefaultChecked] = useState<boolean>(
		account.default || otherDefaultAccount === undefined,
	);

	const capitalType = `${capitalizeWord(account.service)} ${capitalizeWord(account.type)}`;

	return (
		<div className='flex flex-1 flex-col gap-6'>
			<div className='flex flex-col gap-4'>
				<AccountPreview account={{ ...account, default: defaultChecked }} />

				<ToggleField
					label='Set as default account?'
					value={defaultChecked}
					onChange={setDefaultChecked}
					description={`When enabled, this account will be automatically used by any widget with ${capitalType} account slots.`}
				/>

				{otherDefaultAccount && defaultChecked && (
					<div className='flex gap-1 rounded-2 border-2 border-amber-800 bg-yellow-100 p-2 text-3.5 text-amber-900'>
						<strong className=''>Note:</strong>
						<p>
							This will replace{' '}
							<span className='inline-flex items-baseline gap-1'>
								<img
									src={otherDefaultAccount.image}
									className='size-5 self-center rounded-1'
								/>
								<strong>{otherDefaultAccount.displayName}</strong>
							</span>{' '}
							as the default <strong>{capitalType}</strong> account.
						</p>
					</div>
				)}
			</div>

			<div className='flex justify-end'>
				<DialogConfirmButton
					onClick={() => {
						if (defaultChecked) {
							setDefaultAccount(accountId, account.service, account.type);
						} else {
							setAccount({
								...account,
								default: false,
							});
						}

						closeDialog();
					}}
				>
					Save
				</DialogConfirmButton>
			</div>
		</div>
	);
}
