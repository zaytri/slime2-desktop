import { i18nStringTransform } from '@/helpers/i18n';
import SettingHeader from './SettingHeader';
import SettingEditorMenu from './menu/SettingEditorMenu';

export type CategoryEditorProps = {
	id: string;
	index: number;
	label: string;
};

export default function CategoryEditor({
	id,
	index,
	label,
	children,
}: Props.WithChildren<CategoryEditorProps>) {
	return (
		<div className='flex flex-col'>
			<SettingHeader id={id} type='category' label={i18nStringTransform(label)}>
				<SettingEditorMenu id={id} index={index} type='category' />
			</SettingHeader>

			<div className='-mt-1 flex flex-col gap-2 rounded-bl-2 border-l-8 border-yellow-900 pt-3 pb-2 pl-2'>
				{children}
			</div>
		</div>
	);
}
