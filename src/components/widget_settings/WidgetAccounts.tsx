import useAccounts from '@/contexts/accounts/useAccounts';
import { useAccountsDispatch } from '@/contexts/accounts/useAccountsDispatch';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useWidgetMeta } from '@/contexts/widget_metas/useWidgetMeta';
import AuthenticationDialog from '@@/dialog/AuthenticationDialog';
import { groupAccounts, type Account } from '@@/json/accounts';
import ExclamationTriangleSvg from '@@/svg/ExclamationTriangleSvg';
import TriangleDownSvg from '@@/svg/TriangleDownSvg';
import {
	Select,
	SelectGroup,
	SelectGroupLabel,
	SelectItem,
	SelectLabel,
	SelectPopover,
	SelectProvider,
} from '@ariakit/react';
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

	if (!widgetMeta) return null;

	return (
		<div className='grid grid-cols-3 gap-2 rounded-2 border border-white bg-zinc-100 bg-linear-to-b from-zinc-50 to-zinc-100 p-2 outline-2 outline-zinc-300'>
			{widgetMeta.accounts.map((slot, slotIndex) => {
				const { type, service } = slot;
				let slottedAccount: Account | undefined = undefined;
				const otherSlotAccounts: Account[] = [];
				let defaultSlotAccount: Account | null = null;

				for (const otherAccount of otherAccounts) {
					if (otherAccount.service === service && otherAccount.type === type) {
						otherSlotAccounts.push(otherAccount);

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
						defaultSlotAccount = defaultAccount;

						// use default account if slot is still empty
						if (!slottedAccount) {
							slottedAccount = defaultAccount;
						}
						break;
					}
				}

				const slotAccounts = [
					{
						label: 'Default Account',
						options: defaultSlotAccount ? [defaultSlotAccount] : [],
					},
					{ label: 'Other Accounts', options: otherSlotAccounts },
				];

				const buttonClassName = clsx(
					'group/dropdown input-wrapper flex gap-2 p-2 input-wrapper-over',
				);

				return (
					<SelectProvider
						key={
							slottedAccount?.id
								? `${slottedAccount.id}_slot_${slotIndex}`
								: `empty_${service}_${type}_slot_${slotIndex}`
						}
						value={slottedAccount?.default ? 'default' : slottedAccount?.id}
						setValue={(accountId: string) => {
							slotAccount(accountId, widgetId, slotIndex);
						}}
					>
						<SelectLabel className='sr-only capitalize'>
							{service} {type} Account Slot
						</SelectLabel>

						{!defaultSlotAccount && otherSlotAccounts.length === 0 ? (
							<button
								type='button'
								className={buttonClassName}
								onClick={() => {
									if (!defaultSlotAccount && otherSlotAccounts.length === 0) {
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
							</button>
						) : (
							<Select className={buttonClassName}>
								<MiniAccountPreview
									account={slottedAccount}
									service={service}
									type={type}
								/>
							</Select>
						)}

						<SelectPopover
							modal
							sameWidth
							fitViewport
							gutter={6}
							hideOnEscape={event => {
								// prevents closing dialog if inside a dialog
								event.stopPropagation();
								return true;
							}}
							className='dark-menu p-0!'
						>
							<p className='border-b border-zinc-700 bg-zinc-800 px-2 py-1.5 font-medium text-zinc-100 text-shadow-[0_1px_black]'>
								My{' '}
								<strong className='capitalize'>
									{service} {type}
								</strong>{' '}
								Accounts
							</p>
							<div className='flex flex-col overflow-y-auto p-1.5'>
								{slotAccounts.map(group => {
									if (group.options.length === 0) return null;

									return (
										<SelectGroup
											key={group.label}
											className='flex flex-col not-first:mt-1 not-first:border-t not-first:border-zinc-500 not-first:pt-1'
										>
											<SelectGroupLabel className='dark-menu-group-label text-zinc-300'>
												{group.label}
											</SelectGroupLabel>
											{group.options.map(account => {
												const value = account.default ? 'default' : account.id;
												return (
													<AccountItem
														key={value}
														value={value}
														imageSrc={account.image}
														name={account.displayName}
														disabled={account.reauthorize}
													/>
												);
											})}
										</SelectGroup>
									);
								})}
							</div>
						</SelectPopover>
					</SelectProvider>
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

type AccountItemProps = {
	value: string;
	disabled: boolean;
	imageSrc: string;
	name: string;
};

function AccountItem({ value, imageSrc, name, disabled }: AccountItemProps) {
	return (
		<SelectItem value={value} disabled={disabled} className='dark-menu-item'>
			<div className='flex items-center gap-2'>
				<img src={imageSrc} className='size-6 rounded-1' />
				<p className={clsx(disabled && 'line-through')}>{name}</p>
			</div>
		</SelectItem>
	);
}
