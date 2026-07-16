import { relaunch } from '@tauri-apps/plugin-process';
import type { Update } from '@tauri-apps/plugin-updater';
import { useState } from 'react';
import ExternalLink from '../ExternalLink';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogConfirmButton from './DialogButton/DialogConfirmButton';
import DialogContent from './DialogContent';

const RELEASES_URL = 'https://github.com/zaytri/slime2-desktop/releases';

type UpdateDialogProps = {
	update: Update;
};

export default function UpdateDialog({ update }: UpdateDialogProps) {
	const [totalBytes, setTotalBytes] = useState<number | null>(null);
	const [currentBytes, setCurrentBytes] = useState(0);
	const [installing, setInstalling] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [installError, setInstallError] = useState('');

	async function installUpdate() {
		setDownloading(true);
		try {
			await update.downloadAndInstall(event => {
				switch (event.event) {
					case 'Started':
						const newTotalBytes = event.data.contentLength ?? null;
						console.debug('Update Download Started:', newTotalBytes, 'bytes');
						setTotalBytes(newTotalBytes);
						break;
					case 'Progress':
						const addedBytes = event.data.chunkLength;
						console.debug('Update Download Progress:', addedBytes, 'bytes');
						setCurrentBytes(value => value + addedBytes);
						break;
					case 'Finished':
						console.debug(
							'Update Download Finished!',
							currentBytes,
							'/',
							totalBytes,
							'bytes',
						);
						setDownloading(false);
						setInstalling(true);
						break;
				}
			});
			console.debug('Update Installed!');
			await relaunch();
		} catch (error) {
			setDownloading(false);
			setInstalling(false);
			console.error('Update failed! Error:', error);
			setInstallError(`Automatic update failed! Error: ${error}`);
		}
	}

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

			{(downloading || installing) && (
				<div className='flex flex-col'>
					<label htmlFor='update-progress' className='flex justify-between'>
						<span className='text-4.5'>
							{downloading ? 'Downloading...' : 'Installing...'}
						</span>
						<span>
							{downloading && totalBytes && (
								<p>
									{Math.floor(Math.min(1, currentBytes / totalBytes) * 100)}%
								</p>
							)}
						</span>
					</label>

					<progress
						id='update-progress'
						value={
							totalBytes && downloading
								? Math.min(currentBytes, totalBytes)
								: undefined
						}
						max={totalBytes && downloading ? totalBytes : undefined}
					></progress>
					{downloading && (
						<p className='self-end text-3.5'>
							(
							{totalBytes
								? `${Math.min(currentBytes, totalBytes)} B of ${totalBytes} B`
								: `${currentBytes} B`}{' '}
							bytes...)
						</p>
					)}
				</div>
			)}

			{installError && (
				<div className='flex flex-col'>
					<strong className='font-bold text-rose-900'>{installError}</strong>
					<p>
						<ExternalLink
							href={'https://zaytri.itch.io/slime2'}
							className='text-4.5 font-bold text-green-700 underline'
						>
							Manually download and install
						</ExternalLink>
					</p>
				</div>
			)}

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton onClick={installUpdate}>
					Install Update
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
