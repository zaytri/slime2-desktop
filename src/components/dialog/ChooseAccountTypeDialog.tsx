import { useDialog } from '@/contexts/dialog/useDialog';
import { Account } from '@/helpers/json/accounts';
import { Field, Label, Radio, RadioGroup } from '@headlessui/react';
import { memo, useState } from 'react';
import AccountLoginDialog from './AccountLoginDialog';
import DialogHeader from './DialogHeader';

const ACCOUNT_TYPE_OPTIONS: {
	value: Account['type'];
	title: string;
	description: string;
}[] = [
	{
		value: 'read',
		title: '📖 Event Reader',
		description:
			'Allows widgets to read data from events such as follows, subscriptions, chat messages, etc.',
	},
	{
		value: 'bot',
		title: '🤖 Chat Bot',
		description: 'Allows widgets to send chat messages.',
	},
];

const ChooseAccountTypeDialog = memo(function ChooseAccountTypeDialog() {
	const { openDialog } = useDialog();
	const [type, setType] = useState<Account['type']>('read');

	return (
		<div>
			<DialogHeader>Choose Account Type</DialogHeader>

			<div className='flex flex-col gap-3'>
				<RadioGroup
					value={type}
					onChange={setType}
					className='font-quicksand flex flex-col gap-3 max-w-96'
				>
					{ACCOUNT_TYPE_OPTIONS.map(option => {
						return (
							<Field
								key={option.value}
								className='border-2 border-slate-300 text-slate-500 rounded-2 py-2 px-4 has-data-checked:bg-lime-200 has-data-checked:border-emerald-800 has-data-checked:text-emerald-900 cursor-pointer'
							>
								<Radio value={option.value} className='cursor-pointer'>
									<Label className='cursor-pointer select-none flex flex-col'>
										<strong className='text-4.5'>{option.title}</strong>
										<p className='text-3.5 font-medium'>{option.description}</p>
									</Label>
								</Radio>
							</Field>
						);
					})}
				</RadioGroup>
				<button
					className='rounded-2 over:translate-y-0.5 over:bg-none over:shadow-none flex-1 border-2 border-emerald-800 bg-lime-400 bg-linear-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-center text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800'
					onClick={() => {
						openDialog(<AccountLoginDialog accountType={type} />);
					}}
				>
					Next
				</button>
			</div>
		</div>
	);
});

export default ChooseAccountTypeDialog;
