import AddAccountDialog from '@/components/dialog/AddAccountDialog';
import Header from '@/components/header/Header';
import HeaderButton from '@/components/header/HeaderButton';
import HeaderText from '@/components/header/HeaderText';
import ArrowLeftSvg from '@/components/svg/ArrowLeftSvg';
import PlusSvg from '@/components/svg/PlusSvg';
import useAccounts from '@/contexts/accounts/useAccounts';
import { useDialog } from '@/contexts/dialog/useDialog';
import { memo } from 'react';

const Settings = memo(function Settings() {
	const { openDialog } = useDialog();
	const accounts = useAccounts();

	return (
		<div className='flex w-full flex-col'>
			<Header className='w-full items-center gap-3 p-3'>
				<HeaderButton back icon={<ArrowLeftSvg className='size-7' />}>
					Back
				</HeaderButton>

				<HeaderText className='flex-1'>Settings</HeaderText>
			</Header>

			<div className='p-4'>
				<div className='flex flex-col gap-2'>
					<h2 className='text-6 font-medium'>Accounts</h2>
					<div className='rounded-2 flex flex-wrap gap-4 border border-stone-400 p-4'>
						<button
							className='flex flex-col items-center gap-1'
							onClick={() => {
								openDialog(<AddAccountDialog />);
							}}
						>
							<div className='relative'>
								<div className='absolute inset-1 -z-10 rounded-full bg-lime-300'></div>
								<PlusSvg className='size-24 text-emerald-700' />
							</div>

							<p>Add Account</p>
						</button>

						{Object.values(accounts).map(account => {
							return (
								<button
									key={account.id}
									className='flex flex-col items-center gap-1'
									onClick={() => {}}
								>
									<div className='relative'>
										<div className='absolute inset-1 -z-10 rounded-full bg-lime-300'></div>
										<img className='size-24 rounded-full' src={account.image} />
										{account.reauthorize && (
											<div className='absolute top-0 rounded-full bg-rose-900 px-2 font-bold text-white'>
												REAUTH
											</div>
										)}
									</div>

									<p>{account.displayName}</p>
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
});

export default Settings;
