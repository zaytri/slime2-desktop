import SliderField from '@/components/input_fields/SliderField';
import TextField from '@/components/input_fields/TextField';
import PaperAirplaneSvg from '@@/svg/PaperAirplaneSvg';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';

type SimulateTwitchRaidDialogProps = {
	onSend: (displayName: string, viewers: number) => void;
};

export default function SimulateTwitchRaidDialog({
	onSend,
}: SimulateTwitchRaidDialogProps) {
	const [name, setName] = useState('');
	const [viewers, setViewers] = useState(100);

	const namePlaceholder = 'MockRaider';

	return (
		<DialogContent className='flex flex-col justify-between gap-6 p-4'>
			<div className='flex flex-1 flex-col gap-2'>
				<TextField
					label='Raider Name'
					value={name}
					placeholder={namePlaceholder}
					onChange={setName}
				/>

				<SliderField
					label='Viewer Count'
					value={viewers}
					onChange={setViewers}
					min={1}
					max={1000}
					step={1}
				/>
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					icon={<PaperAirplaneSvg className='size-4' />}
					onClick={() => {
						const trimmedName = name.trim();

						onSend(trimmedName || namePlaceholder, viewers);
					}}
				>
					Send
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
