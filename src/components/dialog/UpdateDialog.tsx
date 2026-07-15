import ExternalLink from '../ExternalLink';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogConfirmButton from './DialogButton/DialogConfirmButton';
import DialogContent from './DialogContent';

const RELEASES_URL = 'https://github.com/zaytri/slime2-desktop/releases';

type UpdateDialogProps = {
	update: { version: string; currentVersion: string };
};

export default function UpdateDialog({ update }: UpdateDialogProps) {
	return (
		<DialogContent className='flex flex-col justify-between gap-6 p-4'>
			<div className='flex flex-col gap-4'>
				<div>
					<strong className='text-4.5'>
						A new version of Slime2 is available!
					</strong>
					<p>Would you like to download and install it now?</p>
				</div>

				<div>
					<p>
						<strong className='text-5'>v{update.version}</strong> -{' '}
						<ExternalLink
							href={RELEASES_URL}
							className='text-4.5 font-bold text-green-700 underline'
						>
							View Changes
						</ExternalLink>
					</p>
				</div>
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton onClick={() => {}}>
					Install Update
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
