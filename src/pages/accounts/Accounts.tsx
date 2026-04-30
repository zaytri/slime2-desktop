import type { Account as AccountType } from '@/helpers/json/accounts';
import { memo } from 'react';
import Account from './Account';

type AccountsProps = {
	header: string;
	accounts: AccountType[];
	description: string;
};

const Accounts = memo(function Accounts({
	header,
	accounts,
	description,
}: AccountsProps) {
	if (accounts.length === 0) return null;

	return (
		<section className='flex flex-col gap-2'>
			<div className='flex items-end justify-between gap-4 text-shadow-[0_1px_white]'>
				<h2 className='font-fredoka text-5 font-medium'>{header}</h2>
				<em className='text-3.5 text-zinc-600'>{description}</em>
			</div>
			<div className='input-wrapper grid grid-cols-2 gap-4 p-4'>
				{accounts.map(account => {
					return <Account key={account.id} account={account} />;
				})}
			</div>
		</section>
	);
});

export default Accounts;
