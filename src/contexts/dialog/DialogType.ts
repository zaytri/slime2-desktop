export type DialogType = { onCancel?: VoidFunction } & (
	| { name: ''; payload: null }
	| { name: 'CreateTile'; payload: CreateTilePayload }
	| { name: 'TileSettings'; payload: TileSettingsPayload }
	| { name: 'DeleteWidget'; payload: DeleteWidgetPayload }
	| { name: 'DeleteFolder'; payload: DeleteFolderPayload }
	| { name: 'SelectFont'; payload: SelectFontPayload }
	| { name: 'SelectColor'; payload: SelectColorPayload }
	| { name: 'SelectMedia'; payload: SelectMediaPayload }
	| { name: 'SelectMultipleMedia'; payload: SelectMultipleMediaPayload }
	| { name: 'Rename'; payload: RenamePayload }
	| { name: 'AddAccount'; payload?: null }
	| { name: 'TwitchActivation'; payload: TwitchActivationPayload }
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

export type SelectFontPayload = {
	value?: string;
	onChange: (font: string) => void;
};

export type SelectColorPayload = {
	value?: string;
	onSave: (color: string) => void;
};

export type SelectMediaPayload = {
	type: 'image' | 'video' | 'audio';
	onSave: (fileName: string) => void;
};

export type SelectMultipleMediaPayload = {
	type: 'image' | 'video' | 'audio';
	onSave: (fileNames: string[]) => void;
};

export type RenamePayload = {
	value?: string;
	onSave: (value: string) => void;
};

export type TwitchActivationPayload = {
	deviceCode: string;
	userCode: string;
	verificationUri: string;
};
