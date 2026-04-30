import clsx from 'clsx';

type MediaInputPreviewProps = {
	type: 'image' | 'video' | 'audio';
	src: string;
};

export default function MediaInputPreview({
	type,
	src,
	className: customClassName,
}: Props.WithClassName<MediaInputPreviewProps>) {
	const className = clsx('object-scale-down smooth-image', customClassName);

	switch (type) {
		case 'image':
			return <img className={clsx(className)} src={src} />;
		case 'video':
			return (
				<video
					controls
					className={clsx(className, 'size-full')}
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
						'w-full overflow-hidden rounded-full border border-white outline-2 outline-zinc-300 focus-visible:outline-4 focus-visible:outline-lime-600',
					)}
					src={src}
					onLoadStart={lowerVolume}
				/>
			);
		default:
			return null;
	}
}

function lowerVolume(
	event: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement, Event>,
) {
	// load at 25% volume
	event.currentTarget.volume = 0.25;
}
