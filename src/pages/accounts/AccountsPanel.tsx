import HeaderButton from '@/components/header/HeaderButton';
import PlusSvg from '@/components/svg/PlusSvg';
import UserSvg from '@/components/svg/UserSvg';
import useAccounts from '@/contexts/accounts/useAccounts';
import { useDialog } from '@/contexts/dialog/useDialog';
import { groupAccounts } from '@/helpers/json/accounts';
import AuthenticationDialog from '@@/dialog/AuthenticationDialog';
import Accounts from './Accounts';

export default function AccountsPanel() {
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
					<h1 className='flex flex-1 items-center gap-4 text-white text-shadow-[0_2px_black]'>
						<UserSvg className='-mb-0.5 size-6 drop-shadow-[0_2px_black]' />
						<p className='font-mochiy text-5'>My Accounts</p>
					</h1>

					<HeaderButton
						label='Add Account'
						icon={PlusSvg}
						className='border-lime-400 bg-lime-300 from-lime-400 to-green-400 text-green-900 over:outline-green-600'
						onClick={() => {
							addAccount();
						}}
					/>
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
}
