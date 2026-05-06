import useAccounts from '@/contexts/accounts/useAccounts';
import { useAccountsDispatch } from '@/contexts/accounts/useAccountsDispatch';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useWidgetMeta } from '@/contexts/widget_metas/useWidgetMeta';
import AuthenticationDialog from '@@/dialog/AuthenticationDialog';
import { groupAccounts, type Account } from '@@/json/accounts';
import ExclamationTriangleSvg from '@@/svg/ExclamationTriangleSvg';
import TriangleDownSvg from '@@/svg/TriangleDownSvg';
import {
	Button,
	Field,
	Label,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from '@headlessui/react';
import clsx from 'clsx';
import AccountServiceTag from '../tag/AccountServiceTag';
import { AccountDefaultTag, AccountReauthTag } from '../tag/AccountStatusTag';
import AccountTypeTag from '../tag/AccountTypeTag';

type WidgetAccountsProps = {
	widgetId: string;
};

export default function WidgetAccounts({ widgetId }: WidgetAccountsProps) {
	const { widgetMeta } = useWidgetMeta(widgetId);
	const { slotAccount } = useAccountsDispatch();
	const { openDialog } = useDialog();

	const accounts = useAccounts();
	const { defaultAccounts, otherAccounts } = groupAccounts(
		Object.values(accounts),
	);

	return (
		<div className='grid grid-cols-3 gap-2 rounded-2 border border-white bg-zinc-100 bg-linear-to-b from-zinc-50 to-zinc-100 p-2 outline-2 outline-zinc-300'>
			{widgetMeta.accounts.map((slot, slotIndex) => {
				const { type, service } = slot;
				let slottedAccount: Account | undefined = undefined;
				const filteredAccounts: Account[] = [];

				for (const otherAccount of otherAccounts) {
					if (otherAccount.service === service && otherAccount.type === type) {
						filteredAccounts.push(otherAccount);

						// manually slotted account found
						if (otherAccount.widgets[widgetId] === slotIndex) {
							slottedAccount = otherAccount;
						}
					}
				}

				for (const defaultAccount of defaultAccounts) {
					if (
						defaultAccount.service === service &&
						defaultAccount.type === type
					) {
						filteredAccounts.unshift(defaultAccount);

						// use default account if slot is still empty
						if (!slottedAccount) {
							slottedAccount = defaultAccount;
						}
						break;
					}
				}

				const AccountButton =
					filteredAccounts.length === 0 ? Button : ListboxButton;

				return (
					<Field
						key={
							slottedAccount?.id
								? `${slottedAccount.id}_slot_${slotIndex}`
								: `empty_${service}_${type}_slot_${slotIndex}`
						}
					>
						<Label className='sr-only capitalize'>
							{service} {type} Account Slot
						</Label>
						<Listbox
							value={slottedAccount?.default ? 'default' : slottedAccount?.id}
							onChange={(accountId: string) => {
								slotAccount(accountId, widgetId, slotIndex);
							}}
						>
							<AccountButton
								className='group/dropdown input-wrapper flex gap-2 p-2 input-wrapper-over'
								onClick={() => {
									if (filteredAccounts.length === 0) {
										openDialog(
											'No Accounts Found',
											<AuthenticationDialog slot={{ service, type }} />,
										);
									}
								}}
							>
								<MiniAccountPreview
									account={slottedAccount}
									service={service}
									type={type}
								/>
							</AccountButton>
							<ListboxOptions
								anchor='bottom'
								className='z-10 flex w-(--button-width) flex-col rounded-2 bg-white shadow-[0_2px_10px_#0006] outline-4 -outline-offset-2 outline-lime-600'
							>
								{filteredAccounts.map(account => {
									return (
										<ListboxOption
											key={account.default ? 'default' : account.id}
											value={account.default ? 'default' : account.id}
											disabled={account.reauthorize}
											className={clsx(
												'group/option flex flex-col px-3 py-1.5 data-focus:bg-lime-200 data-focus:outline data-focus:outline-lime-600',
												account.default && 'border-b border-lime-600',
											)}
										>
											{account.default && (
												<p className='text-3.25 font-bold capitalize'>
													Default {service} {type} Account
												</p>
											)}
											<div className={clsx('flex items-center gap-2')}>
												<img src={account.image} className='size-6 rounded-1' />
												<p className='font-medium group-data-disabled/option:text-zinc-500 group-data-disabled/option:line-through'>
													{account.displayName}
												</p>
											</div>
										</ListboxOption>
									);
								})}
							</ListboxOptions>
						</Listbox>
					</Field>
				);
			})}
		</div>
	);
}

type MiniAccountPreviewProps = {
	account?: Account;
	service: Account['service'];
	type: Account['type'];
};

function MiniAccountPreview({
	account,
	service,
	type,
}: MiniAccountPreviewProps) {
	return (
		<div className='flex flex-1 flex-col gap-1'>
			<div className='flex flex-1 gap-2'>
				<div className='size-14 self-center'>
					{account ? (
						account.reauthorize ? (
							<div className='relative flex size-full items-center justify-center overflow-hidden rounded-1 bg-yellow-300 p-1 text-amber-700 outline-2 outline-yellow-500'>
								<ExclamationTriangleSvg className='size-full' />
							</div>
						) : (
							<img src={account.image} className='size-full rounded-1' />
						)
					) : (
						<div className='flex size-full items-center justify-center rounded-1 border border-white bg-alpha-checkerboard p-1 text-zinc-400 outline outline-zinc-300'></div>
					)}
				</div>

				<div className='flex flex-1 flex-col'>
					<div className='flex flex-1 gap-2'>
						<p
							className={clsx(
								'flex-1 text-4.5 font-bold',
								!account && 'font-medium text-zinc-400 italic',
								account?.reauthorize && 'text-zinc-500 line-through',
							)}
						>
							{account ? account.displayName : 'Empty'}
						</p>
						<div className='flex size-5 items-center justify-center rounded-1 group-data-over/dropdown:bg-lime-600 group-data-over/dropdown:text-white group-data-over/dropdown:outline-2'>
							<TriangleDownSvg className='size-3 pt-0.5' />
						</div>
					</div>

					<div className='flex gap-1 text-3.5 font-bold'>
						<AccountServiceTag
							service={service}
							mini={account && (account.default || account.reauthorize)}
						/>
						<AccountTypeTag
							type={type}
							mini={account && (account.default || account.reauthorize)}
						/>
						{account?.default && <AccountDefaultTag mini />}
						{account?.reauthorize && <AccountReauthTag mini />}
					</div>
				</div>
			</div>

			{account?.reauthorize && (
				<p className='-mb-1 text-left text-3.5 font-medium text-rose-800'>
					Go to the Accounts tab to fix errors
				</p>
			)}
		</div>
	);
}
