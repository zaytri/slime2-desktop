import type { WidgetMeta } from '@@/json/widgetMeta';
import PhotoSvg from '@@/svg/PhotoSvg';
import UserSvg from '@@/svg/UserSvg';
import Tag from './Tag';

type WidgetTypeTagProps = {
	type: WidgetMeta['type'][0];
	mini?: boolean;
};

export default function WidgetTypeTag({ type, mini }: WidgetTypeTagProps) {
	switch (type) {
		case 'bot':
			return (
				<Tag
					label='Bot'
					icon={<UserSvg className='size-4' />}
					className='border-cyan-700 bg-cyan-600'
					mini={mini}
				/>
			);
		case 'overlay':
			return (
				<Tag
					label='Overlay'
					icon={<PhotoSvg className='size-4' />}
					className='border-indigo-600 bg-indigo-500'
					mini={mini}
				/>
			);
		default:
			return null;
	}
}
