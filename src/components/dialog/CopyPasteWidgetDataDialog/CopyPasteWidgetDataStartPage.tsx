import { usePage } from '@/contexts/pages/usePage';
import { usePageContext } from '@/contexts/pages/usePageContext';
import ClipboardSvg from '@@/svg/ClipboardSvg';
import DoubleSquareSvg from '@@/svg/DoubleSquareSvg';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useState } from 'react';
import type { CopyPasteWidgetDataContext, CopyPasteWidgetDataPages } from '.';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';

export default function CopyPasteWidgetDataStartPage() {
	const { setPage } = usePage<CopyPasteWidgetDataPages>();
	const { widgetValues } = usePageContext<CopyPasteWidgetDataContext>();

	const [copied, setCopied] = useState(false);

	return (
		<div className='flex max-w-96 flex-1 flex-col justify-between gap-6 pt-2'>
			<div className='flex flex-col gap-4'>
				<DialogConfirmButton
					icon={<DoubleSquareSvg className='size-6' />}
					onClick={async () => {
						const json = JSON.stringify(widgetValues, null, '\t');
						await writeText(json);
						setCopied(true);
					}}
				>
					Copy Widget Data
				</DialogConfirmButton>

				{copied && (
					<p className='-mt-2 rounded-full px-2 text-center font-semibold'>
						Copied to clipboard!
					</p>
				)}

				<DialogConfirmButton
					onClick={() => {
						setPage('import');
					}}
					icon={<ClipboardSvg className='size-6' />}
				>
					Paste Widget Data
				</DialogConfirmButton>
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
			</div>
		</div>
	);
}
