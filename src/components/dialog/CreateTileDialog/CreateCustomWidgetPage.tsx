import LinkifyText from '@/components/LinkifyText';
import AccountServiceTag from '@/components/tag/AccountServiceTag';
import WidgetTypeTag from '@/components/tag/WidgetTypeTag';
import { useDialog } from '@/contexts/dialog/useDialog';
import { usePageContext } from '@/contexts/pages/usePageContext';
import { extractWidgetDetails } from '@/helpers/commands';
import { openZip } from '@/helpers/openFile';
import logZodError from '@/helpers/zodError';
import {
	getWidgetMetaServices,
	WidgetMetaZ,
	type WidgetMeta,
} from '@@/json/widgetMeta';
import ArrowDownTraySvg from '@@/svg/ArrowDownTraySvg';
import { useState } from 'react';
import type { CreateTileContext } from '.';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';

export default function CreateCustomWidgetPage() {
	const { closeDialog } = useDialog();
	const { onCreateCustomWidget } = usePageContext<CreateTileContext>();
	const [widgetMeta, setWidgetMeta] = useState<WidgetMeta | null>(null);
	const [zipPath, setZipPath] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex flex-col gap-4'>
				<button
					type='button'
					className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-2 font-fredoka text-4.5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
					onClick={async () => {
						const zipPath = await openZip();
						if (!zipPath) return;

						try {
							const extractedString = await extractWidgetDetails(zipPath);
							try {
								const extractedMeta = WidgetMetaZ.parse(
									JSON.parse(extractedString),
								);
								setWidgetMeta(extractedMeta);
								setZipPath(zipPath);
								setError(null);
							} catch (error) {
								logZodError(error, extractedString);
								setError(
									'Widget ZIP config/meta.json is formatted incorrectly!',
								);
								setZipPath(null);
								setWidgetMeta(null);
							}
						} catch (error) {
							console.error(error);
							setError('Failed to find config/meta.json within Widget ZIP!');
							setZipPath(null);
							setWidgetMeta(null);
						}
					}}
				>
					<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
					<div className='relative flex flex-1 items-center justify-center gap-3 drop-shadow-[0_1px_3px_#FFFB]'>
						<ArrowDownTraySvg className='h-5' />
						<p>Select Widget ZIP</p>
					</div>
				</button>

				{widgetMeta && <WidgetMetaPreview {...widgetMeta} />}

				{error && (
					<div className='flex gap-1 rounded-2 border-2 border-rose-800 bg-rose-100 p-2 text-3.5 text-rose-900'>
						<strong className='font-extrabold'>Error:</strong>{' '}
						<p className='font-medium'>{error}</p>
					</div>
				)}
			</div>

			<div className='flex justify-end'>
				<DialogConfirmButton
					disabled={!!error || !zipPath || !widgetMeta}
					icon={<ArrowDownTraySvg className='size-4.5' />}
					onClick={() => {
						if (!error && zipPath && widgetMeta) {
							onCreateCustomWidget(zipPath);
							closeDialog();
						}
					}}
				>
					Import
				</DialogConfirmButton>
			</div>
		</div>
	);
}

function WidgetMetaPreview(widgetMeta: WidgetMeta) {
	const services = getWidgetMetaServices(widgetMeta);

	return (
		<div className='flex max-w-140 gap-4 rounded-2 border-2 border-zinc-300 bg-white p-3'>
			<div className='flex flex-1 flex-col gap-2'>
				<div className='flex items-center gap-6'>
					<h3 className='flex-1 text-shadow-[0_1px_white]'>
						<span className='font-mochiy text-zinc-800'>{widgetMeta.name}</span>
						<span className='pl-2 font-fredoka font-medium text-zinc-500'>
							v{widgetMeta.version}
						</span>
					</h3>

					<div className='flex gap-1 text-3.5 font-semibold'>
						{services.includes('twitch') && (
							<AccountServiceTag service='twitch' />
						)}
						{services.includes('youtube') && (
							<AccountServiceTag service='youtube' />
						)}
						{widgetMeta.type.includes('bot') && <WidgetTypeTag type='bot' />}
						{widgetMeta.type.includes('overlay') && (
							<WidgetTypeTag type='overlay' />
						)}
					</div>
				</div>

				<div className='flex flex-1 gap-3 border-t border-zinc-300 pt-2'>
					<LinkifyText
						className='flex flex-1 flex-col'
						linkClassName='text-green-700 font-semibold'
					>
						<MetaDetail label='Creator'>{widgetMeta.creator}</MetaDetail>
						{widgetMeta.website && (
							<MetaDetail label='Website'>{widgetMeta.website}</MetaDetail>
						)}
						{widgetMeta.support && (
							<MetaDetail label='Support'>{widgetMeta.support}</MetaDetail>
						)}
					</LinkifyText>
				</div>
			</div>
		</div>
	);
}

type MetaDetailProps = {
	label: string;
};

function MetaDetail({ label, children }: Props.WithChildren<MetaDetailProps>) {
	return (
		<p>
			<strong className='pr-1.5 font-fredoka font-medium text-zinc-800'>
				{label}:
			</strong>
			<span className='font-semibold'>{children}</span>
		</p>
	);
}
