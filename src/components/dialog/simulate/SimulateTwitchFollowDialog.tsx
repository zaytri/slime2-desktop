import TextField from '@/components/input_fields/TextField';
import PaperAirplaneSvg from '@@/svg/PaperAirplaneSvg';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';

type SimulateTwitchFollowDialogProps = {
	onSend: (displayName: string) => void;
};

export default function SimulateTwitchFollowDialog({
	onSend,
}: SimulateTwitchFollowDialogProps) {
	const [name, setName] = useState('');
	const namePlaceholder = 'MockFollower';

	return (
		<DialogContent className='flex flex-col justify-between gap-6 p-4'>
			<TextField
				label='Follower Name'
				value={name}
				placeholder={namePlaceholder}
				onChange={setName}
			/>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					icon={<PaperAirplaneSvg className='size-4' />}
					onClick={() => {
						const trimmedName = name.trim();

						onSend(trimmedName || namePlaceholder);
					}}
				>
					Send
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
