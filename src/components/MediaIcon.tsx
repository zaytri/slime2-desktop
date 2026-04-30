import { MediaType } from '@/helpers/openFile';
import { memo } from 'react';
import MusicNotesSvg from './svg/MusicNotesSvg';
import PhotoSvg from './svg/PhotoSvg';
import VideoCameraSvg from './svg/VideoCameraSvg';

type MediaIconProps = {
	type: MediaType;
};

const MediaIcon = memo(function MediaIcon({
	type,
	className,
}: Props.WithClassName<MediaIconProps>) {
	switch (type) {
		case 'audio':
			return <MusicNotesSvg className={className} />;
		case 'image':
			return <PhotoSvg className={className} />;
		case 'video':
			return <VideoCameraSvg className={className} />;
		default:
			return null;
	}
});

export default MediaIcon;
