import type { MediaType } from '@/helpers/openFile';
import MusicNoteSvg from './svg/MusicNoteSvg';
import PhotoSvg from './svg/PhotoSvg';
import VideoCameraSvg from './svg/VideoCameraSvg';

type MediaIconProps = {
	type: MediaType;
};

export default function MediaIcon({
	type,
	className,
}: Props.WithClassName<MediaIconProps>) {
	switch (type) {
		case 'audio':
			return <MusicNoteSvg className={className} />;
		case 'image':
			return <PhotoSvg className={className} />;
		case 'video':
			return <VideoCameraSvg className={className} />;
		default:
			return null;
	}
}
