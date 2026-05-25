import SliderField from '@/components/input_fields/SliderField';
import TextAreaField from '@/components/input_fields/TextAreaField';
import TextField from '@/components/input_fields/TextField';
import {
	POWER_UP_MAX_BITS,
	POWER_UP_MIN_BITS,
} from '@/hooks/twitch_mock/useTwitchMockPowerUp';
import PaperAirplaneSvg from '@@/svg/PaperAirplaneSvg';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';

type SimulateTwitchPowerUpDialogProps = {
	onSend: (
		displayName: string,
		powerUpName: string,
		bits: number,
		description: string,
		userText: string,
	) => void;
};

export default function SimulateTwitchPowerUpDialog({
	onSend,
}: SimulateTwitchPowerUpDialogProps) {
	const [name, setName] = useState('');
	const [powerUp, setPowerUp] = useState('');
	const [bits, setBits] = useState(100);
	const [description, setDescription] = useState('');
	const [text, setText] = useState('');

	const namePlaceholder = 'MockChatter';
	const powerUpPlaceholder = 'MockPowerUp';
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
						label='Power-Up Name'
						value={powerUp}
						onChange={setPowerUp}
						placeholder={powerUpPlaceholder}
					/>

					<SliderField
						label='Power-Up Bits Cost'
						value={bits}
						onChange={setBits}
						step={1}
						min={POWER_UP_MIN_BITS}
						max={POWER_UP_MAX_BITS}
					/>

					<TextAreaField
						label='Power-Up Description'
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
						const trimmedPowerUp = powerUp.trim();

						onSend(
							trimmedName || namePlaceholder,
							trimmedPowerUp || powerUpPlaceholder,
							bits,
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
