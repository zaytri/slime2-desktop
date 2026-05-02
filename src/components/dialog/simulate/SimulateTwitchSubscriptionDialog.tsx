import SelectField from '@/components/input_fields/SelectField';
import SliderField from '@/components/input_fields/SliderField';
import TextAreaField from '@/components/input_fields/TextAreaField';
import TextField from '@/components/input_fields/TextField';
import ToggleField from '@/components/input_fields/ToggleField';
import PaperAirplaneSvg from '@@/svg/PaperAirplaneSvg';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';

type SimulateTwitchSubscriptionDialogProps = {
	onSend: (
		displayName: string,
		tier: Twitch.SubTier,
		resub: boolean,
		text: string,
		streakMonths: number,
		totalMonths: number,
		prime: boolean,
	) => void;
};

export default function SimulateTwitchSubscriptionDialog({
	onSend,
}: SimulateTwitchSubscriptionDialogProps) {
	const [name, setName] = useState('');
	const [tier, setTier] = useState<Twitch.SubTier | 'prime'>('1000');
	const [resub, setResub] = useState(false);
	const [text, setText] = useState('');
	const [totalMonths, setTotalMonths] = useState(50);
	const [streakMonths, setStreakMonths] = useState(10);

	const namePlaceholder = 'MockSubscriber';
	const textPlaceholder = 'Yippee!';

	return (
		<DialogContent className='flex flex-col justify-between gap-6 p-4'>
			<div className='flex flex-1 gap-6'>
				<section className='flex w-80 flex-1 flex-col gap-2'>
					<h3 className='text-4.5 font-bold text-shadow-[0_1px_white]'>
						Subscription
					</h3>

					<TextField
						label='Subscriber Name'
						value={name}
						placeholder={namePlaceholder}
						onChange={setName}
					/>

					<SelectField
						label='Tier'
						value={tier}
						onChange={setTier}
						options={[
							// { label: 'Prime', value: 'prime' },
							{ label: 'Tier 1', value: '1000' },
							{ label: 'Tier 2', value: '2000' },
							{ label: 'Tier 3', value: '3000' },
						]}
					/>

					<ToggleField
						label='Resubscription?'
						value={resub}
						onChange={setResub}
					/>
				</section>

				{resub && (
					<section className='flex w-80 flex-1 flex-col gap-2'>
						<h3 className='text-4.5 font-bold text-shadow-[0_1px_white]'>
							Resubscription
						</h3>

						<TextAreaField
							label='Resubscription Message'
							value={text}
							onChange={setText}
							rows={2}
							placeholder={textPlaceholder}
						/>

						<SliderField
							label='Subscription Streak Months'
							value={streakMonths}
							onChange={setStreakMonths}
							step={1}
							min={0}
							max={100}
						/>

						<SliderField
							label='Total Months Subscribed'
							value={totalMonths}
							onChange={setTotalMonths}
							step={1}
							min={2}
							max={100}
						/>
					</section>
				)}
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					icon={<PaperAirplaneSvg className='size-4' />}
					onClick={() => {
						const trimmedName = name.trim();
						const trimmedText = text.trim();

						onSend(
							trimmedName || namePlaceholder,
							tier === 'prime' ? '1000' : tier,
							resub,
							trimmedText || textPlaceholder,
							streakMonths,
							totalMonths,
							tier === 'prime',
						);
					}}
				>
					Send
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
