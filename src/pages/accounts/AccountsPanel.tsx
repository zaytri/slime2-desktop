import PlusSvg from '@/components/svg/PlusSvg';
import UserSvg from '@/components/svg/UserSvg';
import useAccounts from '@/contexts/accounts/useAccounts';
import { useDialog } from '@/contexts/dialog/useDialog';
import { groupAccounts } from '@/helpers/json/accounts';
import AuthenticationDialog from '@@/dialog/AuthenticationDialog';
import { memo } from 'react';
import Accounts from './Accounts';

const AccountsPanel = memo(function AccountsPanel() {
	const accounts = useAccounts();
	const { openDialog } = useDialog();
	const { defaultAccounts, otherAccounts } = groupAccounts(
		Object.values(accounts),
	);

	function addAccount() {
		openDialog('Choose Account Type', <AuthenticationDialog />);
	}

	return (
		<div className='flex flex-1 p-4'>
			<div className='flex flex-1 flex-col gap-4 overflow-hidden dark-container p-6 pt-4'>
				<div className='flex items-center gap-4'>
					<h1 className='flex flex-1 items-center gap-4 font-fredoka text-6 font-medium text-white text-shadow-[0_2px_black]'>
						<UserSvg className='size-6 drop-shadow-[0_2px_black]' />
						<p className='-mb-0.5'>My Accounts</p>
					</h1>

					<button
						type='button'
						className='relative flex overflow-hidden rounded-2 border border-lime-400 bg-lime-300 bg-linear-to-b from-lime-400 to-green-400 px-2 py-2 text-4.5 font-bold text-green-900 over:bg-none over:outline-4 over:outline-offset-4 over:outline-green-600'
						onClick={() => {
							addAccount();
						}}
					>
						<div className='absolute inset-0 bottom-[45%] bg-linear-to-b from-white/30 to-white/20'></div>
						<div className='relative flex flex-1 items-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
							<PlusSvg className='size-4.5' />
							<p className='-mb-0.5'>Add Account</p>
						</div>
					</button>
				</div>

				<div className='flex flex-1 overflow-hidden light-container'>
					<div className='flex flex-1 flex-col gap-4 overflow-y-auto p-4'>
						{defaultAccounts.length === 0 && otherAccounts.length === 0 ? (
							<p className='text-4.5'>
								No accounts found.{' '}
								<button
									className='font-bold text-green-600 underline'
									onClick={() => {
										addAccount();
									}}
								>
									Add a new account
								</button>
								?
							</p>
						) : (
							<>
								<Accounts
									header='Default Accounts'
									accounts={defaultAccounts}
									description='Automatically slotted into widgets'
								/>
								<Accounts
									header='Other Accounts'
									accounts={otherAccounts}
									description='Need to be manually slotted into widgets'
								/>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
});

export default AccountsPanel;
