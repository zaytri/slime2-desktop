import SliderField from '@/components/input_fields/SliderField';
import TextAreaField from '@/components/input_fields/TextAreaField';
import TextField from '@/components/input_fields/TextField';
import PaperAirplaneSvg from '@@/svg/PaperAirplaneSvg';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';

type SimulateTwitchRedeemDialogProps = {
	onSend: (
		displayName: string,
		rewardName: string,
		cost: number,
		description: string,
		userText: string,
	) => void;
};

export default function SimulateTwitchRedeemDialog({
	onSend,
}: SimulateTwitchRedeemDialogProps) {
	const [name, setName] = useState('');
	const [reward, setReward] = useState('');
	const [cost, setCost] = useState(100);
	const [description, setDescription] = useState('');
	const [text, setText] = useState('');

	const namePlaceholder = 'MockChatter';
	const rewardPlaceholder = 'MockReward';
	const optionalPlaceholder = '(Optional)';

	return (
		<DialogContent className='flex flex-col justify-between gap-6 p-4'>
			<div className='flex flex-1 gap-6'>
				<section className='flex w-80 flex-1 flex-col gap-2'>
					<h3 className='text-4.5 font-bold text-shadow-[0_1px_white]'>
						Chatter
					</h3>

					<TextField
						label='Chatter Name'
						value={name}
						placeholder={namePlaceholder}
						onChange={setName}
					/>

					<TextAreaField
						label='Chatter Message'
						value={text}
						onChange={setText}
						placeholder={optionalPlaceholder}
						rows={5}
					/>
				</section>

				<section className='flex w-80 flex-1 flex-col gap-2'>
					<h3 className='text-4.5 font-bold text-shadow-[0_1px_white]'>
						Reward
					</h3>

					<TextField
						label='Reward Name'
						value={reward}
						onChange={setReward}
						placeholder={rewardPlaceholder}
					/>

					<SliderField
						label='Channel Point Cost'
						value={cost}
						onChange={setCost}
						step={1}
						min={1}
						max={999999}
					/>

					<TextAreaField
						label='Reward Description'
						value={description}
						onChange={setDescription}
						placeholder={optionalPlaceholder}
						rows={2}
					/>
				</section>
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					icon={<PaperAirplaneSvg className='size-4' />}
					onClick={() => {
						const trimmedName = name.trim();
						const trimmedReward = reward.trim();

						onSend(
							trimmedName || namePlaceholder,
							trimmedReward || rewardPlaceholder,
							cost,
							description.trim(),
							text.trim(),
						);
					}}
				>
					Send
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
