import { Description, Field, Input, Label } from '@headlessui/react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { memo, useState } from 'react';
import DoubleSquareSvg from '../svg/DoubleSquareSvg';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogContent from './DialogContent';

type OverlayURLDialogProps = {
	link: string;
};

const OverlayURLDialog = memo(function OverlayURLDialog({
	link,
}: OverlayURLDialogProps) {
	const [copied, setCopied] = useState(false);

	return (
		<DialogContent className='flex flex-col justify-between gap-4 p-4'>
			<Field className='flex flex-col gap-4'>
				<div className='flex flex-col'>
					<Label className='pl-2 text-4.5 font-semibold text-shadow-[0_1px_white]'>
						URL
					</Label>
					<div className='input-wrapper flex overflow-visible p-0'>
						<Input
							value={link}
							className='flex-1 pr-1 pl-2 input-class'
							readOnly
						/>
						<button
							type='button'
							className='relative flex rounded-2 border border-white bg-lime-200 bg-linear-to-b from-lime-200 to-lime-300 px-2 py-1 font-bold text-lime-800 outline-2 outline-offset-0! outline-lime-600 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
							onClick={async () => {
								await writeText(link);
								setCopied(true);
							}}
						>
							<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
							<div className='relative flex flex-1 items-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
								<DoubleSquareSvg className='size-4' />
								<p>{copied ? 'Copied!' : 'Copy'}</p>
							</div>
						</button>
					</div>
				</div>
				<Description
					as='div'
					className='mx-0.5 rounded-2 border-2 border-zinc-300 bg-white px-3 py-2'
				>
					<ol className='list-decimal pl-4'>
						<li>
							<strong>Copy</strong> the URL <strong>above</strong>.
						</li>
						<li>
							Open <strong>OBS Studio</strong> (or other streaming software).
						</li>
						<li>
							Create a new <strong>Browser Source</strong>.
						</li>
						<li>
							<strong>Paste</strong> into the <strong>URL field</strong>.
						</li>
					</ol>
				</Description>
			</Field>

			<div className='flex justify-end'>
				<DialogCancelButton />
			</div>
		</DialogContent>
	);
});

export default OverlayURLDialog;
