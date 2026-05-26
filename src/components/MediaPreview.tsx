import { DEFAULT_VOLUME } from '@@/json/widgetValues';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';

type MediaPreviewProps = {
	type: 'image' | 'video' | 'audio';
	src: string;
	volume?: number;
};

export default function MediaPreview({
	type,
	src,
	volume = DEFAULT_VOLUME,
	className: customClassName,
}: Props.WithClassName<MediaPreviewProps>) {
	const className = clsx('object-scale-down smooth-image', customClassName);
	const videoRef = useRef<HTMLVideoElement>(null);
	const audioRef = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		function updateVolume() {
			if (videoRef.current) videoRef.current.volume = volume;
			if (audioRef.current) audioRef.current.volume = volume;
		}

		updateVolume();
		videoRef.current?.addEventListener('loadstart', updateVolume);
		audioRef.current?.addEventListener('loadstart', updateVolume);

		return () => {
			videoRef.current?.removeEventListener('loadstart', updateVolume);
			audioRef.current?.removeEventListener('loadstart', updateVolume);
		};
	}, [volume, videoRef.current, audioRef.current]);

	switch (type) {
		case 'image':
			return <img className={className} src={src} />;
		case 'video':
			return <VideoPreview ref={videoRef} className={className} src={src} />;
		case 'audio':
			return <AudioPreview ref={audioRef} className={className} src={src} />;
		default:
			return null;
	}
}

type VideoPreviewProps = {
	ref?: React.Ref<HTMLVideoElement | null>;
	src: string;
};

function VideoPreview({
	ref,
	className,
	src,
}: Props.WithClassName<VideoPreviewProps>) {
	return (
		<video
			ref={ref}
			controls
			controlsList='nodownload noplaybackrate'
			disablePictureInPicture
			className={clsx(className, 'size-full')}
			src={src}
		/>
	);
}

type AudioPreviewProps = {
	ref?: React.Ref<HTMLAudioElement | null>;
	src: string;
};

function AudioPreview({
	ref,
	className,
	src,
}: Props.WithClassName<AudioPreviewProps>) {
	return (
		<audio
			ref={ref}
			controls
			controlsList='nodownload noplaybackrate'
			className={clsx(
				className,
				'w-full overflow-hidden rounded-full border border-white outline-2 outline-zinc-400 focus-visible:outline-4 focus-visible:outline-lime-600',
			)}
			src={src}
		/>
	);
}
