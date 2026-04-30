import BookSvg from '@/components/svg/BookSvg';
import ShieldSvg from '@/components/svg/ShieldSvg';
import UserSvg from '@/components/svg/UserSvg';
import { Account } from '@/helpers/json/accounts';
import TwitchSvg from '@@/svg/TwitchSvg';
import clsx from 'clsx';
import { memo } from 'react';

const AccountLabel = memo(function AccountLabel({
	className,
	children,
}: Props.WithClassNameAndChildren) {
	return (
		<div
			className={clsx(
				'flex items-center gap-1.5 rounded-1 border px-2 py-0.5 text-white',
				className,
			)}
		>
			{children}
		</div>
	);
});

export default AccountLabel;

type ServiceLabelProps = {
	service: Account['service'];
};

export const ServiceLabel = memo(function ServiceLabel({
	service,
}: ServiceLabelProps) {
	switch (service) {
		case 'twitch':
			return (
				<AccountLabel className='border-violet-700 bg-[#9146FF]'>
					<TwitchSvg className='size-4' />
					<p>Twitch</p>
				</AccountLabel>
			);
		case 'youtube':
		default:
			return null;
	}
});

type TypeLabelProps = {
	type: Account['type'];
};

export const TypeLabel = memo(function TypeLabel({ type }: TypeLabelProps) {
	switch (type) {
		case 'read':
			return (
				<AccountLabel className='border-yellow-700 bg-yellow-600'>
					<BookSvg className='size-4' />
					<p>Read</p>
				</AccountLabel>
			);
		case 'bot':
			return (
				<AccountLabel className='border-cyan-700 bg-cyan-600'>
					<UserSvg className='size-4' />
					<p>Bot</p>
				</AccountLabel>
			);

		case 'mod':
			return (
				<AccountLabel className='border-lime-700 bg-lime-600'>
					<ShieldSvg className='size-4' />
					<p>Mod</p>
				</AccountLabel>
			);

		default:
			return null;
	}
});
