import HeaderButton from '@/components/header/HeaderButton';
import HeaderIcon from '@/components/header/HeaderIcon';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useSettings } from '@/contexts/settings/useSettings';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { useWidgetId } from '@/contexts/widget_id/useWidgetId';
import { useWidgetMeta } from '@/contexts/widget_metas/useWidgetMeta';
import useWidgetValues from '@/contexts/widget_values/useWidgetValues';
import { useWidgetValuesDispatch } from '@/contexts/widget_values/useWidgetValuesDispatch';
import useWidgetsPanel from '@/contexts/widgets_panel/useWidgetsPanel';
import { getTileIconSrc } from '@/helpers/media';
import { DEV_WIDGET_SERVER_PORT, PROD_PORT } from '@/helpers/serverBaseUrl';
import useEditTile from '@/hooks/useEditTile';
import CopyPasteWidgetDataDialog from '@@/dialog/CopyPasteWidgetDataDialog';
import ExportZipDialog from '@@/dialog/ExportZipDialog';
import OverlayURLDialog from '@@/dialog/OverlayURLDialog';
import ArrowLeftRightSvg from '@@/svg/ArrowLeftRightSvg';
import ArrowLeftSvg from '@@/svg/ArrowLeftSvg';
import ArrowUpTraySvg from '@@/svg/ArrowUpTraySvg';
import ChainLinkSvg from '@@/svg/ChainLinkSvg';
import EyeSvg from '@@/svg/EyeSvg';
import GearSvg from '@@/svg/GearSvg';
import PencilSvg from '@@/svg/PencilSvg';
import {
	Menu,
	MenuButton,
	MenuButtonArrow,
	MenuItem,
	MenuProvider,
} from '@ariakit/react';
import { appDataDir } from '@tauri-apps/api/path';
import { revealItemInDir } from '@tauri-apps/plugin-opener';

export default function WidgetHeader() {
	const widgetId = useWidgetId();
	const { onBackWidget } = useWidgetsPanel();
	const { tileMeta } = useTileMeta(widgetId);
	const { settings } = useSettings();
	const { openDialog } = useDialog();
	const { widgetMeta } = useWidgetMeta(widgetId);
	const editTile = useEditTile();

	return (
		<header className='flex items-center gap-3'>
			<button
				type='button'
				autoFocus
				onClick={onBackWidget}
				className='group/back rounded-1 p-2 text-white outline-offset-0! over:text-green-200 over:outline-4 over:outline-green-400'
			>
				<p className='sr-only'>Back</p>
				<ArrowLeftSvg className='size-7 drop-shadow-[0_2px_black] group-over/back:drop-shadow-none' />
			</button>

			{tileMeta.icon && (
				<HeaderIcon src={getTileIconSrc(widgetId, tileMeta.icon)} />
			)}

			<h1 className='line-clamp-1 flex-1 font-mochiy text-5 text-white text-shadow-[0_2px_black]'>
				{tileMeta.name}
			</h1>

			{settings.devMode && (
				<>
					<MenuProvider placement='bottom-end'>
						<MenuButton className='flex items-center gap-2 rounded-2 border-2 border-green-300 bg-zinc-900 p-2 text-4.5 font-bold text-green-300 *:drop-shadow-[0_1px_black] over:bg-green-900 over:outline-4 over:outline-offset-4 over:outline-green-700'>
							<GearSvg className='size-6' />
							<p className='-mb-0.5'>Dev Tools</p>
							<MenuButtonArrow />
						</MenuButton>
						<Menu
							modal
							gutter={0}
							className='z-30 flex flex-col rounded-2 bg-zinc-900 p-1.5 font-semibold text-green-300 shadow-[0_2px_10px_#000B] outline-2 outline-green-300'
						>
							<MenuItem
								autoFocus
								render={
									<button
										type='button'
										className='flex items-center gap-2 rounded-1 px-2 py-1 outline-offset-0! *:drop-shadow-[0_1px_black] over:bg-green-900 over:text-green-200'
										onClick={async () => {
											const baseDirectory = await appDataDir();
											const widgetDirectory = [
												baseDirectory,
												'tiles',
												widgetId,
												// opens folder by revealing this subfolder
												'config',
											].join('\\');
											try {
												await revealItemInDir(widgetDirectory);
											} catch (error) {
												console.error(error);
											}
										}}
									/>
								}
							>
								<EyeSvg className='size-5' />
								<p className='-mb-0.5'>Open Folder</p>
							</MenuItem>

							<MenuItem
								render={
									<button
										type='button'
										className='flex items-center gap-2 rounded-1 px-2 py-1 outline-offset-0! *:drop-shadow-[0_1px_black] over:bg-green-900 over:text-green-200'
										onClick={() => {
											openDialog(
												'Export Widget ZIP',
												<ExportZipDialog widgetId={widgetId} />,
											);
										}}
									/>
								}
							>
								<ArrowUpTraySvg className='size-5' />
								<p className='-mb-0.5'>Export ZIP</p>
							</MenuItem>
						</Menu>
					</MenuProvider>
				</>
			)}

			<HeaderButton
				label='Edit'
				icon={PencilSvg}
				className='border-cyan-300 bg-cyan-300 from-cyan-300 to-sky-400 text-sky-900 over:outline-cyan-600'
				onClick={() => {
					editTile(widgetId, 'widget');
				}}
			/>

			<ImportExportButton />

			{widgetMeta.type.includes('overlay') && (
				<HeaderButton
					label='Overlay URL'
					icon={ChainLinkSvg}
					className='border-yellow-300 bg-yellow-300 from-yellow-300 to-amber-400 text-amber-900 over:outline-yellow-600'
					onClick={() => {
						openDialog(
							'Overlay URL',
							<OverlayURLDialog
								link={`http://localhost:${import.meta.env.PROD ? `${PROD_PORT}/widget` : DEV_WIDGET_SERVER_PORT}/?widgetId=${widgetId}`}
							/>,
						);
					}}
				/>
			)}
		</header>
	);
}

function ImportExportButton() {
	const { openDialog } = useDialog();
	const widgetValues = useWidgetValues();
	const { replace } = useWidgetValuesDispatch();

	return (
		<HeaderButton
			label='Copy/Paste'
			icon={ArrowLeftRightSvg}
			className='border-lime-400 bg-lime-300 from-lime-400 to-green-400 text-green-900 over:outline-green-600'
			onClick={() => {
				openDialog(
					'Copy/Paste Widget Settings',
					<CopyPasteWidgetDataDialog
						widgetValues={widgetValues}
						replace={replace}
					/>,
				);
			}}
		/>
	);
}
