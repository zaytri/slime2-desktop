import clsx from 'clsx';
import { memo } from 'react';

type MediaInputPreviewProps = {
	type: 'image' | 'video' | 'audio';
	src: string;
};

const MediaInputPreview = memo(function MediaInputPreview({
	type,
	src,
}: MediaInputPreviewProps) {
	const className = 'max-h-64 object-scale-down';

	switch (type) {
		case 'image':
			return <img className={clsx(className, 'drop-shadow')} src={src} />;
		case 'video':
			return (
				<video
					controls
					className={clsx(className, 'w-full drop-shadow')}
					src={src}
					onLoadStart={lowerVolume}
				/>
			);
		case 'audio':
			return (
				<audio
					controls
					className={clsx(
						className,
						'w-full overflow-hidden rounded-full border border-white outline-2 outline-stone-300 focus-visible:outline-black',
					)}
					src={src}
					onLoadStart={lowerVolume}
				/>
			);
		default:
			return null;
	}
});

export default MediaInputPreview;

function lowerVolume(
	event: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement, Event>,
) {
	// load at 25% volume
	event.currentTarget.volume = 0.25;
}
