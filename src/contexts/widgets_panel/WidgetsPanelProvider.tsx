import { useState } from 'react';
import { useFolderId } from '../folder_id/useFolderId';
import useTileFolder, { TILES_PER_PAGE } from '../tile_locations/useTileFolder';
import { WidgetsPanelContext } from './useWidgetsPanel';

export default function WidgetsPanelProvider({ children }: Props.WithChildren) {
	const { folderId, setFolderId } = useFolderId();
	const { pageCount } = useTileFolder(folderId);
	const [widgetId, setWidgetId] = useState<string | null>(null);
	const [page, setPage] = useState<number>(0);

	function onFolder(newFolderId: string) {
		setPage(0);
		setFolderId(newFolderId);
	}

	function onWidget(newWidgetId: string | null) {
		setWidgetId(newWidgetId);
	}

	function onBackWidget() {
		setWidgetId(null);
	}

	// goes to previous page or loops to last page
	function onPageLeft() {
		setPage(page === 0 ? pageCount : page - 1);
	}

	// goes to next page or loops to first page
	function onPageRight() {
		setPage((page + 1) % (pageCount + 1));
	}

	function onBackFolder(folderIndex: number) {
		setPage(Math.floor(folderIndex / TILES_PER_PAGE));
		setFolderId('main');
	}

	return (
		<WidgetsPanelContext
			value={{
				page,
				setPage,
				widgetId,
				onWidget,
				onFolder,
				onBackWidget,
				onPageLeft,
				onPageRight,
				onBackFolder,
			}}
		>
			{children}
		</WidgetsPanelContext>
	);
}
