import { usePage } from '@/contexts/pages/usePage';
import { usePageContext } from '@/contexts/pages/usePageContext';
import type { Account } from '@@/json/accounts';
import BookSvg from '@@/svg/BookSvg';
import ChatBubbleSvg from '@@/svg/ChatBubbleSvg';
import CheckSvg from '@@/svg/CheckSvg';
import {
	Description,
	Field,
	Label,
	Radio,
	RadioGroup,
} from '@headlessui/react';
import { useState } from 'react';
import type { AuthenticationContext, AuthenticationPages } from '.';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';

export default function AuthTypePage() {
	const { setPage } = usePage<AuthenticationPages>();
	const { setType } = usePageContext<AuthenticationContext>();
	const [tempType, setTempType] = useState<Account['type']>();

	return (
		<div className='flex flex-1 flex-col justify-between gap-6'>
			<RadioGroup
				value={tempType}
				onChange={setTempType}
				className='flex flex-col gap-4'
			>
				<AuthTypeOption
					value='read'
					description='Reads event data from this account such as follows, subscriptions, chat messages, etc.'
				>
					<BookSvg className='size-4.5' />
					<p className='-mb-0.5'>Read Account</p>
				</AuthTypeOption>
				<AuthTypeOption
					value='bot'
					description='Can send chat messages from this account.'
				>
					<ChatBubbleSvg className='size-4.5' />
					<p className='-mb-0.5'>Bot Account</p>
				</AuthTypeOption>
			</RadioGroup>

			<div className='flex justify-end'>
				<DialogConfirmButton
					disabled={tempType === undefined}
					onClick={() => {
						// this shouldn't happen since the button is disabled
						if (tempType === undefined) return;

						setType(tempType);
						setPage('service');
					}}
				>
					Next
				</DialogConfirmButton>
			</div>
		</div>
	);
}

type AuthTypeOptionProps = {
	value: Account['type'];
	description: string;
};

function AuthTypeOption({
	value,
	children,
	description,
}: Props.WithChildren<AuthTypeOptionProps>) {
	return (
		<Field className='rounded-2 bg-white text-zinc-600 outline-2 -outline-offset-1 outline-zinc-300 has-data-checked:outline-lime-600 over:bg-lime-200 over:text-green-900 over:outline-4 over:outline-lime-600'>
			<Radio
				value={value}
				className='group/radio flex cursor-pointer flex-col overflow-hidden rounded-2 outline-offset-4 outline-lime-600 focus-visible:outline-4'
			>
				<Label className='relative flex cursor-pointer items-center gap-2 px-3 pt-2 pb-1.5 text-5 font-bold select-none group-data-checked/radio:bg-lime-600 group-data-checked/radio:text-white *:group-data-checked/radio:drop-shadow-[0_1px_#0006]'>
					{children}
					<div className='absolute top-2 right-3 bottom-1.5 hidden items-center group-data-checked/radio:flex'>
						<CheckSvg className='size-4.5' />
					</div>
				</Label>
				<Description className='cursor-pointer px-3 pt-1 pb-2 text-3.5 font-semibold'>
					{description}
				</Description>
			</Radio>
		</Field>
	);
}
