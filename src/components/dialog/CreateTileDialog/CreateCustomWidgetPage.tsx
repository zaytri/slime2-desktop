import { useDialog } from '@/contexts/dialog/useDialog';
import { extractWidgetDetails } from '@/helpers/commands';
import { openZip } from '@/helpers/openFile';
import { WidgetMetaZ } from '@@/json/widgetMeta';
import ArrowDownTraySvg from '@@/svg/ArrowDownTraySvg';
import { useState } from 'react';

export default function CreateCustomWidgetPage() {
	const { closeDialog } = useDialog();
	const [metaString, setMetaString] = useState<string | null>(null);
	const [zipPath, setZipPath] = useState<string | null>(null);

	const meta = WidgetMetaZ.parse(metaString);

	return (
		<button
			type='button'
			className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-2 font-fredoka text-4.5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
			onClick={async () => {
				const zipPath = await openZip();
				if (!zipPath) return;

				setZipPath(zipPath);

				try {
					const extracted = await extractWidgetDetails(zipPath);
					setMetaString(extracted);
				} catch (error) {
					console.error(error);
				}
			}}
		>
			<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
			<div className='relative flex flex-1 items-center justify-center gap-3 drop-shadow-[0_1px_3px_#FFFB]'>
				<ArrowDownTraySvg className='h-5' />
				<p>Select ZIP</p>
			</div>
		</button>
	);
}

function parseWidgetMeta(string: string | null) {}
