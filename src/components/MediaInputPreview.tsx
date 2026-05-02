import clsx from 'clsx';
import { useEffect, useRef } from 'react';

type MediaInputPreviewProps = {
	type: 'image' | 'video' | 'audio';
	src: string;
	volume?: number;
};

export default function MediaInputPreview({
	type,
	src,
	volume,
	className: customClassName,
}: Props.WithClassName<MediaInputPreviewProps>) {
	const className = clsx('object-scale-down smooth-image', customClassName);
	const videoRef = useRef<HTMLVideoElement>(null);
	const audioRef = useRef<HTMLAudioElement>(null);
	const volumeValue = (volume === undefined ? 20 : volume) / 100;

	useEffect(() => {
		switch (type) {
			case 'video': {
				if (videoRef.current) {
					videoRef.current.volume = volumeValue;
				}
				break;
			}
			case 'audio': {
				if (audioRef.current) {
					audioRef.current.volume = volumeValue;
				}
				break;
			}
		}
	}, [volumeValue, videoRef.current, audioRef.current]);

	switch (type) {
		case 'image':
			return <img className={clsx(className)} src={src} />;
		case 'video':
			return (
				<video
					ref={videoRef}
					controls
					controlsList='nodownload noplaybackrate'
					disablePictureInPicture
					className={clsx(className, 'size-full')}
					src={src}
					onLoadStart={event => {
						event.currentTarget.volume = volumeValue;
					}}
				/>
			);
		case 'audio':
			return (
				<audio
					ref={audioRef}
					controls
					controlsList='nodownload noplaybackrate'
					className={clsx(
						className,
						'w-full overflow-hidden rounded-full border border-white outline-2 outline-zinc-400 focus-visible:outline-4 focus-visible:outline-lime-600',
					)}
					src={src}
					onLoadStart={event => {
						event.currentTarget.volume = volumeValue;
					}}
				/>
			);
		default:
			return null;
	}
}
