import { useAccount } from '@/contexts/accounts/useAccount';
import useAccounts from '@/contexts/accounts/useAccounts';
import { useAccountsDispatch } from '@/contexts/accounts/useAccountsDispatch';
import { useDialog } from '@/contexts/dialog/useDialog';
import { Description, Field, Label, Switch } from '@headlessui/react';
import { memo, useState } from 'react';
import AccountPreview from '../AccountPreview';
import CheckSvg from '../svg/CheckSvg';
import XSvg from '../svg/XSvg';
import DialogHeader from './DialogHeader';

type AccountSuccessDialogProps = {
	id: string;
};

const AccountSuccessDialog = memo(function AccountSuccessDialog({
	id,
}: AccountSuccessDialogProps) {
	const { account: authenticatedAccount, setAccount } = useAccount(id);
	const accounts = useAccounts();
	const { setDefaultAccount } = useAccountsDispatch();
	const { closeDialog } = useDialog();

	const otherDefaultAccountExists = Object.values(accounts).every(
		account =>
			account.type !== authenticatedAccount.type ||
			account.service !== authenticatedAccount.service ||
			!account.default,
	);

	const [defaultChecked, setDefaultChecked] = useState(
		authenticatedAccount.default || otherDefaultAccountExists,
	);

	return (
		<div className='max-w-96'>
			<DialogHeader>Account Added!</DialogHeader>

			<div className='flex flex-col gap-4'>
				<AccountPreview account={authenticatedAccount} />

				<Field>
					<Switch
						className='input-wrapper group cursor-pointer items-center justify-between p-0'
						checked={defaultChecked}
						onChange={setDefaultChecked}
						// allows using arrow keys to toggle the switch
						onKeyDown={event => {
							// only run this on this focused element
							if (document.activeElement !== event.currentTarget) return;

							const newCheckedValue =
								event.key === 'ArrowRight' || event.key === 'ArrowUp'
									? true
									: event.key === 'ArrowLeft' || event.key === 'ArrowDown'
										? false
										: null;

							if (newCheckedValue !== null) {
								event.preventDefault();
								setDefaultChecked(newCheckedValue);
							}
						}}
					>
						{({ checked }) => (
							<>
								<Label className='flex-1 cursor-pointer py-1 pl-2 text-left'>
									Set as default account?
								</Label>
								<div className='group rounded-1.5 mr-1 inline-flex h-6 w-11 cursor-pointer items-center bg-stone-300 text-stone-400 transition group-data-checked:bg-lime-600 group-data-checked:text-lime-700 group-data-focus:outline-2 group-data-focus:outline-black'>
									<span className='rounded-1 size-4 translate-x-1 cursor-pointer bg-white p-1 shadow transition group-data-checked:translate-x-6'>
										{checked ? (
											<CheckSvg className='size-full' />
										) : (
											<XSvg className='size-full' />
										)}
									</span>
								</div>
							</>
						)}
					</Switch>

					<Description className='text-3.5 font-quicksand px-2 pt-1 text-stone-500'>
						If enabled, this account will be automatically used by any widget
						that hasn't specified accounts.
					</Description>
				</Field>

				<button
					className='rounded-2 over:translate-y-0.5 over:bg-none over:shadow-none flex-1 border-2 border-emerald-800 bg-lime-400 bg-linear-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-center text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800'
					onClick={() => {
						if (defaultChecked) {
							setDefaultAccount(
								id,
								authenticatedAccount.service,
								authenticatedAccount.type,
							);
						} else {
							setAccount({
								...authenticatedAccount,
								default: false,
							});
						}
						closeDialog();
					}}
				>
					Ok
				</button>
			</div>
		</div>
	);
});

export default AccountSuccessDialog;
