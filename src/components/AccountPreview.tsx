import { Account } from '@/helpers/json/accounts';
import { memo } from 'react';
import TwitchIconColorSvg from './svg/TwitchIconColorSvg';

type AccountPreviewProps = {
	account: Account;
};

function accountTypeEmoji(account: Account) {
	switch (account.type) {
		case 'read':
			return '📖';
		case 'bot':
			return '🤖';
		case 'mod':
			return '🛡️';
	}
}

const AccountPreview = memo(function AccountPreview({
	account,
}: AccountPreviewProps) {
	return (
		<div className='flex flex-col items-center gap-1'>
			<div className='relative'>
				<div className='absolute inset-1 -z-10 rounded-full bg-white'></div>
				<img className='size-24 rounded-full' src={account.image} />
				{account.reauthorize && (
					<div className='absolute top-0 rounded-full bg-rose-900 px-2 font-bold text-white'>
						REAUTH
					</div>
				)}
				<div className='select-none absolute bottom-0 left-0 text-6.5  [font-kerning:none] -ml-1.5 -mb-1.5'>
					{accountTypeEmoji(account)}
				</div>

				{account.service === 'twitch' && (
					<TwitchIconColorSvg className='absolute bottom-0 right-0 size-6' />
				)}
			</div>

			<p>{account.displayName}</p>
		</div>
	);
});

export default AccountPreview;
