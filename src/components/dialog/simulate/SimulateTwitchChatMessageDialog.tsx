import ColorField from '@/components/input_fields/ColorField';
import SelectField from '@/components/input_fields/SelectField';
import TextAreaField from '@/components/input_fields/TextAreaField';
import TextField from '@/components/input_fields/TextField';
import { twitchBadgeMap } from '@/hooks/twitch_mock/twitchMockData';
import PaperAirplaneSvg from '@@/svg/PaperAirplaneSvg';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';
import TwitchBadgeMultiSelect from './TwitchBadgeMultiSelect';

type SimulateTwitchChatMessageDialogProps = {
	onSend: (
		displayName: string,
		badges: Twitch.Badge[],
		color: string,
		type: Twitch.WebsocketEvent.ChatMessage['message_type'] | 'announcement',
		text: string,
		announcementColor: Twitch.ChatNoticeType.Announcement['color'],
	) => void;
};

export default function SimulateTwitchChatMessageDialog({
	onSend,
}: SimulateTwitchChatMessageDialogProps) {
	const [name, setName] = useState('');
	const [badges, setBadges] = useState<Twitch.Badge[]>([]);
	const [color, setColor] = useState('black');
	const [type, setType] = useState<
		Twitch.WebsocketEvent.ChatMessage['message_type'] | 'announcement'
	>('text');
	const [message, setMessage] = useState('');
	const [announcementColor, setAnnouncementColor] =
		useState<Twitch.ChatNoticeType.Announcement['color']>('PRIMARY');
	const namePlaceholder = 'MockChatter';
	const messagePlaceholder = 'Hello!';

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
						Message
					</h3>

					<TextAreaField
						label='Message Text'
						value={message}
						placeholder={messagePlaceholder}
						onChange={setMessage}
						rows={3}
						description='(Emotes cannot be simulated)'
					/>

					<SelectField
						label='Message Type'
						value={type}
						onChange={setType}
						options={[
							{ label: 'Normal', value: 'text' },
							{ label: 'Announcement', value: 'announcement' },
							{
								label: 'Highlighted',
								value: 'channel_points_highlighted',
							},
							{ label: 'First Time Chat', value: 'user_intro' },
						]}
					/>

					{type === 'announcement' && (
						<SelectField
							label='Announcement Color'
							value={announcementColor}
							onChange={setAnnouncementColor}
							options={[
								{ label: 'Primary', value: 'PRIMARY' },
								{ label: 'Blue', value: 'BLUE' },
								{ label: 'Green', value: 'GREEN' },
								{ label: 'Orange', value: 'ORANGE' },
								{ label: 'Purple', value: 'PURPLE' },
							]}
						/>
					)}
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
							type,
							trimmedMessage || messagePlaceholder,
							announcementColor,
						);
					}}
				>
					Send
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
