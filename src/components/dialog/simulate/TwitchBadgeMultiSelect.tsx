import {
	twitchBadgeImageMap,
	type TwitchMockBadgeSetId,
} from '@/hooks/twitch_mock/twitchMockData';
import { Checkbox, Field, Fieldset, Label, Legend } from '@headlessui/react';
import { useEffect, useState } from 'react';

type TwitchBadgeMultiSelectProps = {
	onChange: (values: TwitchMockBadgeSetId[]) => void;
	label: string;
};

export default function TwitchBadgeMultiSelect({
	onChange,
	label,
}: TwitchBadgeMultiSelectProps) {
	const [broadcaster, setBroadcaster] = useState(false);
	const [leadModerator, setLeadModerator] = useState(false);
	const [moderator, setModerator] = useState(false);
	const [vip, setVip] = useState(false);
	const [artist, setArtist] = useState(false);
	const [founder, setFounder] = useState(false);
	const [subscriber, setSubscriber] = useState(false);

	useEffect(() => {
		const badges: TwitchMockBadgeSetId[] = [];

		if (broadcaster) badges.push('broadcaster');
		if (leadModerator) badges.push('lead_moderator');
		if (moderator) badges.push('moderator');
		if (vip) badges.push('vip');
		if (artist) badges.push('artist-badge');
		if (founder) badges.push('founder');
		if (subscriber) badges.push('subscriber');

		onChange(badges);
	}, [broadcaster, leadModerator, moderator, vip, artist, founder, subscriber]);

	return (
		<Fieldset>
			<div className='input-wrapper flex-col input-wrapper-focus-visible'>
				<Legend className='input-label'>{label}</Legend>

				<div className='flex flex-wrap gap-1.5 py-1'>
					<BadgeOption
						label='Broadcaster'
						image={twitchBadgeImageMap.broadcaster}
						value={broadcaster}
						onChange={setBroadcaster}
					/>

					<BadgeOption
						label='Lead Moderator'
						image={twitchBadgeImageMap.lead_moderator}
						value={leadModerator}
						onChange={setLeadModerator}
					/>

					<BadgeOption
						label='Moderator'
						image={twitchBadgeImageMap.moderator}
						value={moderator}
						onChange={setModerator}
					/>

					<BadgeOption
						label='VIP'
						image={twitchBadgeImageMap.vip}
						value={vip}
						onChange={setVip}
					/>

					<BadgeOption
						label='Artist'
						image={twitchBadgeImageMap['artist-badge']}
						value={artist}
						onChange={setArtist}
					/>

					<BadgeOption
						label='Founder'
						image={twitchBadgeImageMap.founder}
						value={founder}
						onChange={setFounder}
					/>

					<BadgeOption
						label='Subscriber'
						image={twitchBadgeImageMap.subscriber}
						value={subscriber}
						onChange={setSubscriber}
					/>
				</div>
			</div>
		</Fieldset>
	);
}

type BadgeOptionProps = {
	value: boolean;
	onChange: (value: boolean) => void;
	label: string;
	image: string;
};

function BadgeOption({ value, label, image, onChange }: BadgeOptionProps) {
	return (
		<Field>
			<Checkbox
				checked={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				className='group/check input-select-option'
			>
				<Label className='flex cursor-pointer items-center gap-1 select-none'>
					<img
						src={image}
						className='size-4 rounded-0.5 grayscale group-data-checked/check:grayscale-0 group-data-over/check:grayscale-0'
					/>
					{label}
				</Label>
			</Checkbox>
		</Field>
	);
}

// allows using arrow keys to navigate through the options
// just like the radio group in SelectInput
function onKeyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
	// only run this on this focused element
	if (document.activeElement !== event.currentTarget) return;

	const parentField = event.currentTarget.parentElement;

	const fieldToFocus =
		event.key === 'ArrowRight' || event.key === 'ArrowDown'
			? // get the next field
				// or the first field if this is the last field
				(parentField?.nextElementSibling ??
				parentField?.parentElement?.firstElementChild)
			: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
				? // get the previous field
					// or the last field if this is the first field
					(parentField?.previousElementSibling ??
					parentField?.parentElement?.lastElementChild)
				: null;

	const checkboxToFocus = fieldToFocus?.firstElementChild;

	if (checkboxToFocus) {
		event.preventDefault();
		(checkboxToFocus as HTMLElement).focus();
	}
}
