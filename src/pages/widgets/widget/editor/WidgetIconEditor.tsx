import HeaderButton from '@/components/header/HeaderButton';
import HeaderIcon from '@/components/header/HeaderIcon';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useWidgetId } from '@/contexts/widget_id/useWidgetId';
import { getTempFileSrc, getWidgetIconSrc } from '@/helpers/media';
import ChangeWidgetCoreIconDialog from '@@/dialog/ChangeWidgetCoreIconDialog';
import PencilSvg from '@@/svg/PencilSvg';

type WidgetIconEditorProps = {
	value: string | null;
	onChange: (value: string) => void;
};

export default function WidgetIconEditor({
	value,
	onChange,
}: WidgetIconEditorProps) {
	const widgetId = useWidgetId();
	const { openDialog } = useDialog();
	const src = value ? getTempFileSrc(value) : getWidgetIconSrc(widgetId);

	return (
		<section className='flex items-center gap-4 border-x border-zinc-600 px-4'>
			<HeaderIcon src={src} />

			<HeaderButton
				label='Change Icon'
				icon={PencilSvg}
				className='border-cyan-300 bg-cyan-300 from-cyan-300 to-sky-400 text-sky-900 over:outline-cyan-600'
				onClick={() => {
					openDialog(
						'Change Widget Icon',
						<ChangeWidgetCoreIconDialog onSave={onChange} />,
					);
				}}
			/>
		</section>
	);
}
