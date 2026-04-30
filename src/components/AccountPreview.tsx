import { Account } from '@/helpers/json/accounts';
import AccountServiceTag from './tag/AccountServiceTag';
import { AccountDefaultTag } from './tag/AccountStatusTag';
import AccountTypeTag from './tag/AccountTypeTag';

type AccountPreviewProps = {
	account: Account;
};

export default function AccountPreview({ account }: AccountPreviewProps) {
	return (
		<div className='flex items-center gap-3 rounded-2 bg-white px-3 py-2 outline-2 outline-zinc-300'>
			<img src={account.image} className='size-14 rounded-2 smooth-image' />

			<div className='flex flex-col gap-1'>
				<p className='flex-1 text-4.5 font-bold'>{account.displayName}</p>

				<div className='flex items-center gap-1 text-3.5 font-bold'>
					<AccountServiceTag service={account.service} />
					<AccountTypeTag type={account.type} />
					{account.default && <AccountDefaultTag />}
				</div>
			</div>
		</div>
	);
}
