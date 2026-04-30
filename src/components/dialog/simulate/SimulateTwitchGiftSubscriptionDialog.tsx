import SelectField from '@/components/input_fields/SelectField';
import SliderField from '@/components/input_fields/SliderField';
import TextField from '@/components/input_fields/TextField';
import ToggleField from '@/components/input_fields/ToggleField';
import PaperAirplaneSvg from '@@/svg/PaperAirplaneSvg';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';

type SimulateTwitchGiftSubscriptionDialogProps = {
	onSend: (
		anonymous: boolean,
		displayName: string,
		tier: Twitch.SubTier,
		count: number,
		total: number,
	) => void;
};

export default function SimulateTwitchGiftSubscriptionDialog({
	onSend,
}: SimulateTwitchGiftSubscriptionDialogProps) {
	const [name, setName] = useState('');
	const [anon, setAnon] = useState(false);
	const [tier, setTier] = useState<Twitch.SubTier>('1000');
	const [count, setCount] = useState(1);
	const [total, setTotal] = useState(100);

	const namePlaceholder = 'MockGifter';

	return (
		<DialogContent className='flex flex-col justify-between gap-6 p-4'>
			<div className='flex flex-1 gap-6'>
				<section className='flex w-80 flex-1 flex-col gap-2'>
					<h3 className='text-4.5 font-bold text-shadow-[0_1px_white]'>
						Gifter
					</h3>

					<ToggleField label='Anonymous?' value={anon} onChange={setAnon} />

					{!anon && (
						<>
							<TextField
								label='Gifter Name'
								value={name}
								placeholder={namePlaceholder}
								onChange={setName}
							/>

							<SliderField
								label='Total Subscriptions Gifted'
								value={total}
								onChange={setTotal}
								step={1}
								min={0}
								max={10000}
							/>
						</>
					)}
				</section>

				<section className='flex w-80 flex-1 flex-col gap-2'>
					<h3 className='text-4.5 font-bold text-shadow-[0_1px_white]'>
						Gift Subscription
					</h3>

					<SelectField
						label='Tier'
						value={tier}
						onChange={setTier}
						options={[
							{ label: 'Tier 1', value: '1000' },
							{ label: 'Tier 2', value: '2000' },
							{ label: 'Tier 3', value: '3000' },
						]}
					/>

					<SliderField
						label='Gift Count'
						value={count}
						onChange={setCount}
						step={1}
						min={1}
						max={1000}
					/>
				</section>
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					icon={<PaperAirplaneSvg className='size-4' />}
					onClick={() => {
						const trimmedName = name.trim();

						onSend(anon, trimmedName || namePlaceholder, tier, count, total);
					}}
				>
					Send
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
