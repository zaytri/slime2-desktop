import HeaderButton from '@/components/header/HeaderButton';
import TileHeader from '@/components/header/TileHeader';
import useDevEditorMode from '@/contexts/dev_editor_mode/useDevEditorMode';
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

	return (
		<TileHeader
			onBack={onBackWidget}
			iconSrc={
				tileMeta.icon ? getTileIconSrc(widgetId, tileMeta.icon) : undefined
			}
			name={tileMeta.name}
		>
			<DevToolsButton />
			<EditButton />
			<ImportExportButton />
			<OverlayUrlButton />
		</TileHeader>
	);
}

function DevToolsButton() {
	const widgetId = useWidgetId();
	const { openDialog } = useDialog();
	const { settings } = useSettings();
	const { setDevEditorMode } = useDevEditorMode();

	if (!settings.devMode) return;

	return (
		<MenuProvider>
			<MenuButton className='mr-0.5 flex items-center gap-2 rounded-2 bg-zinc-800 p-2 text-4.5 font-bold text-white outline-2 outline-white *:drop-shadow-[0_1px_black] over:bg-zinc-600 over:outline-4 over:outline-offset-0!'>
				<GearSvg className='size-6' />
				<p className='-mb-0.5'>Dev Tools</p>
				<MenuButtonArrow />
			</MenuButton>

			<Menu modal gutter={4} className='dark-menu'>
				<MenuItem
					className='dark-menu-item'
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
				>
					<EyeSvg className='w-4.5' />
					<p className='-mb-0.5'>Open Folder</p>
				</MenuItem>

				<MenuItem
					className='dark-menu-item'
					onClick={() => {
						openDialog(
							'Export Widget ZIP',
							<ExportZipDialog widgetId={widgetId} />,
						);
					}}
				>
					<ArrowUpTraySvg className='w-4.5' />
					<p className='-mb-0.5'>Export ZIP</p>
				</MenuItem>

				<MenuItem
					className='dark-menu-item'
					onClick={() => {
						setDevEditorMode(true);
					}}
				>
					<PencilSvg className='w-4.5' />
					<p className='-mb-0.5'>Widget Editor</p>
				</MenuItem>
			</Menu>
		</MenuProvider>
	);
}

function EditButton() {
	const widgetId = useWidgetId();
	const editTile = useEditTile();

	return (
		<HeaderButton
			label='Edit'
			icon={PencilSvg}
			className='border-cyan-300 bg-cyan-300 from-cyan-300 to-sky-400 text-sky-900 over:outline-cyan-600'
			onClick={() => {
				editTile(widgetId, 'widget');
			}}
		/>
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

function OverlayUrlButton() {
	const widgetId = useWidgetId();
	const { widgetMeta } = useWidgetMeta(widgetId);
	const { openDialog } = useDialog();

	if (!widgetMeta || !widgetMeta.type.includes('overlay')) return null;

	return (
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
	);
}
