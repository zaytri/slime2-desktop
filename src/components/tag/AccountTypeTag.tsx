import { Account } from '@/helpers/json/accounts';
import ChatBubbleSvg from '@@/svg/ChatBubbleSvg';
import BookSvg from '../svg/BookSvg';
import ShieldSvg from '../svg/ShieldSvg';
import Tag from './Tag';

type AccountTypeTagProps = {
	type: Account['type'];
	mini?: boolean;
};

export default function AccountTypeTag({ type, mini }: AccountTypeTagProps) {
	switch (type) {
		case 'read':
			return (
				<Tag
					label='Read'
					icon={<BookSvg className='size-4' />}
					className='border-indigo-600 bg-indigo-500'
					mini={mini}
				/>
			);
		case 'bot':
			return (
				<Tag
					label='Bot'
					icon={<ChatBubbleSvg className='size-4' />}
					className='border-cyan-700 bg-cyan-600'
					mini={mini}
				/>
			);

		case 'mod':
			return (
				<Tag
					label='Mod'
					icon={<ShieldSvg className='size-4' />}
					className='border-lime-700 bg-lime-600'
					mini={mini}
				/>
			);

		default:
			return null;
	}
}
