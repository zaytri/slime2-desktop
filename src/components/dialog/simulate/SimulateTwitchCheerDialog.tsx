import ColorField from '@/components/input_fields/ColorField';
import SliderField from '@/components/input_fields/SliderField';
import TextAreaField from '@/components/input_fields/TextAreaField';
import TextField from '@/components/input_fields/TextField';
import { twitchBadgeMap } from '@/hooks/twitch_mock/twitchMockData';
import PaperAirplaneSvg from '@@/svg/PaperAirplaneSvg';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';
import TwitchBadgeMultiSelect from './TwitchBadgeMultiSelect';

type SimulateTwitchCheerDialogProps = {
	onSend: (
		displayName: string,
		badges: Twitch.Badge[],
		color: string,
		bits: number,
		text: string,
	) => void;
};

export default function SimulateTwitchCheerDialog({
	onSend,
}: SimulateTwitchCheerDialogProps) {
	const [name, setName] = useState('');
	const [badges, setBadges] = useState<Twitch.Badge[]>([]);
	const [color, setColor] = useState('black');
	const [message, setMessage] = useState('');
	const [bits, setBits] = useState(100);

	const namePlaceholder = 'MockChatter';
	const messagePlaceholder = 'Enjoy!';

	return (
		<DialogContent className='flex flex-col justify-between gap-6 p-4'>
			<div className='flex flex-1 gap-6'>
				<section className='flex w-80 flex-1 flex-col gap-2'>
					<h3 className='text-4.5 font-bold text-shadow-[0_1px_white]'>
						Chatter
					</h3>

					<TextField
						label='Name'
						value={name}
						placeholder={namePlaceholder}
						onChange={setName}
					/>

					<ColorField label='Name Color' value={color} onChange={setColor} />

					<TwitchBadgeMultiSelect
						label='Badges'
						onChange={values => {
							setBadges(
								values.map(value => {
									return twitchBadgeMap[value];
								}),
							);
						}}
					/>
				</section>

				<section className='flex w-80 flex-1 flex-col gap-2'>
					<h3 className='text-4.5 font-bold text-shadow-[0_1px_white]'>
						Cheer
					</h3>

					<TextAreaField
						label='Message'
						value={message}
						placeholder={messagePlaceholder}
						onChange={setMessage}
						description='(Emotes cannot be simulated)'
					/>

					<SliderField
						label='Bits'
						value={bits}
						onChange={setBits}
						step={1}
						min={1}
						max={100000}
					/>
				</section>
			</div>
			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					icon={<PaperAirplaneSvg className='size-4' />}
					onClick={() => {
						const trimmedName = name.trim();
						const trimmedMessage = message.trim();

						onSend(
							trimmedName || namePlaceholder,
							badges,
							color,
							bits,
							trimmedMessage || messagePlaceholder,
						);
					}}
				>
					Send
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
