export type DialogType = { onCancel?: VoidFunction } & (
	| { name: ''; payload: null }
	| { name: 'CreateTile'; payload: CreateTilePayload }
	| { name: 'TileSettings'; payload: TileSettingsPayload }
	| { name: 'DeleteWidget'; payload: DeleteWidgetPayload }
	| { name: 'DeleteFolder'; payload: DeleteFolderPayload }
);

export type CreateTilePayload = {
	folderId: string;
	index: number;
};

export type TileSettingsPayload = {
	id: string;
};

export type DeleteWidgetPayload = {
	id: string;
};

export type DeleteFolderPayload = {
	id: string;
};
