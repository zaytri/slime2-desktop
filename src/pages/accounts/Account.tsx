import AccountPreview from '@/components/AccountPreview';
import AuthenticationDialog from '@/components/dialog/AuthenticationDialog';
import GenericDeleteDialog from '@/components/dialog/GenericDeleteDialog';
import AccountServiceTag from '@/components/tag/AccountServiceTag';
import {
	AccountDefaultTag,
	AccountReauthTag,
} from '@/components/tag/AccountStatusTag';
import AccountTypeTag from '@/components/tag/AccountTypeTag';
import { useAccount } from '@/contexts/accounts/useAccount';
import { useAccountsDispatch } from '@/contexts/accounts/useAccountsDispatch';
import { useDialog } from '@/contexts/dialog/useDialog';
import type { Account as AccountType } from '@/helpers/json/accounts';
import CheckSvg from '@@/svg/CheckSvg';
import ExclamationTriangleSvg from '@@/svg/ExclamationTriangleSvg';
import GearSvg from '@@/svg/GearSvg';
import TrashSvg from '@@/svg/TrashSvg';
import UserSvg from '@@/svg/UserSvg';
import XSvg from '@@/svg/XSvg';
import {
	Menu,
	MenuArrow,
	MenuButton,
	MenuItem,
	MenuProvider,
} from '@ariakit/react';
import clsx from 'clsx';

type AccountProps = {
	account: AccountType;
};

export default function Account({ account }: AccountProps) {
	const { openDialog } = useDialog();
	const { removeAccount, setDefaultAccount } = useAccountsDispatch();
	const { setAccount } = useAccount(account.id);

	function reauthenticate(account: AccountType) {
		openDialog(
			'Account Connection Expired!',
			<AuthenticationDialog reauth={account} />,
		);
	}

	return (
		<div className='relative flex items-center gap-3 rounded-2 border border-white bg-zinc-100 bg-linear-to-b from-zinc-50 to-zinc-100 px-3 py-2 outline-2 outline-zinc-300'>
			{/* Account Image / Reauthentication */}
			<div className='relative flex size-16 items-center justify-center'>
				{account.reauthorize ? (
					// Reauthentication Button
					<button
						type='button'
						className='group/button relative flex size-full overflow-hidden rounded-2 border border-yellow-400 bg-yellow-300 bg-linear-to-b from-yellow-400 to-amber-400 text-4.5 font-bold text-amber-700 outline-2 outline-amber-700 over:bg-none over:text-amber-600 over:outline-4 over:-outline-offset-1! over:outline-amber-600'
						onClick={() => {
							reauthenticate(account);
						}}
					>
						<div className='absolute inset-0 bottom-[45%] bg-linear-to-b from-white/30 to-white/20'></div>
						<div className='relative flex flex-1 items-center justify-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
							<ExclamationTriangleSvg className='size-10' />
							<span className='sr-only'>Reauthenticate Account</span>
						</div>
						<div className='absolute top-1 right-1 size-2.5 rounded-full bg-rose-600 group-over/button:opacity-50'></div>
					</button>
				) : (
					// Account Image
					<img
						src={account.image}
						className={clsx(
							'size-full rounded-2 smooth-image',
							account.reauthorize && 'opacity-50',
						)}
					/>
				)}
			</div>

			{/* Account Details */}
			<div className='flex flex-1 flex-col items-stretch gap-1'>
				{/* Account Name */}
				<h3
					className={clsx(
						'text-4.5 font-bold text-shadow-[0_1px_white]',
						account.reauthorize &&
							'text-zinc-500 line-through text-shadow-none',
					)}
				>
					{account.displayName}
				</h3>

				{/* Labels */}
				<div className='flex gap-1 font-semibold'>
					<AccountServiceTag service={account.service} />
					<AccountTypeTag type={account.type} />
					{account.default && <AccountDefaultTag />}
					{account.reauthorize && <AccountReauthTag />}
				</div>
			</div>

			{/* Account Options Menu */}
			<div className='absolute top-1 right-1'>
				<MenuProvider placement='bottom-start'>
					<MenuButton className='rounded-1.5 p-1.5 text-zinc-700 aria-expanded:bg-lime-600 aria-expanded:text-lime-100 over:bg-lime-600 over:text-lime-100 over:outline-none'>
						<GearSvg className='size-5' />
						<span className='sr-only'>Account Options</span>
					</MenuButton>
					<Menu
						modal
						className='z-30 flex flex-col rounded-2 bg-white p-1.5 text-4 font-semibold shadow-[0_2px_10px_#0006] outline-4 outline-lime-600'
					>
						<MenuArrow className='*:fill-lime-600' />

						{account.reauthorize && (
							<MenuItem
								render={
									<button
										type='button'
										className={clsx(
											'flex items-center gap-2 rounded-1 px-2 py-1 text-zinc-800 outline-offset-0! over:bg-lime-200 over:text-lime-900 over:outline over:outline-lime-600',
										)}
										onClick={() => {
											reauthenticate(account);
										}}
									/>
								}
							>
								<UserSvg className='size-4' />
								<p className='-mb-0.5'>Reconnect</p>
							</MenuItem>
						)}

						{/* Toggle Default Action */}
						<MenuItem
							render={
								<button
									type='button'
									className={clsx(
										'flex items-center gap-2 rounded-1 px-2 py-1 text-zinc-800 outline-offset-0! over:outline',
										account.default
											? 'over:bg-yellow-200 over:text-amber-900 over:outline-amber-600'
											: 'over:bg-lime-200 over:text-lime-900 over:outline-lime-600',
									)}
									onClick={() => {
										if (account.default) {
											setAccount({
												...account,
												default: false,
											});
										} else {
											setDefaultAccount(
												account.id,
												account.service,
												account.type,
											);
										}
									}}
								/>
							}
						>
							{account.default ? (
								<XSvg className='size-4' />
							) : (
								<CheckSvg className='size-4' />
							)}
							<p className='-mb-0.5'>
								{account.default ? (
									<>Clear Default Status</>
								) : (
									<>
										Set as Default{' '}
										<strong className='font-extrabold capitalize'>
											{account.service} {account.type}
										</strong>
									</>
								)}
							</p>
						</MenuItem>

						{/* Remove Account Action */}
						<MenuItem
							render={
								<button
									type='button'
									className='flex items-center gap-2 rounded-1 px-2 py-1 text-rose-900 outline-offset-0! over:bg-rose-100 over:outline over:outline-rose-600'
									onClick={() => {
										openDialog(
											'Remove Account',
											<GenericDeleteDialog
												onDelete={() => {
													removeAccount(account.id);
												}}
												actionText='Remove'
											>
												<div className='flex flex-col gap-4'>
													<p>
														Are you sure you want to <strong>remove</strong>{' '}
														this account?
													</p>

													<AccountPreview account={account} />
												</div>
											</GenericDeleteDialog>,
										);
									}}
								/>
							}
						>
							<TrashSvg className='size-4' />
							<p className='-mb-0.5'>Remove Account</p>
						</MenuItem>
					</Menu>
				</MenuProvider>
			</div>
		</div>
	);
}
