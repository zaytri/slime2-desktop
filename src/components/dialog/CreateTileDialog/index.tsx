import DialogContent from '@/components/dialog/DialogContent';
import { useDialog } from '@/contexts/dialog/useDialog';
import PageContextProvider from '@/contexts/pages/PageContextProvider';
import PageProvider from '@/contexts/pages/PageProvider';
import { usePage } from '@/contexts/pages/usePage';
import type { DefaultWidgetId } from '@/helpers/defaultWidgets';
import { useEffect, useState } from 'react';
import CreateFolderPage from './CreateFolderPage';
import CreateStartPage from './CreateStartPage';
import CreateWidgetPage from './CreateWidgetPage';

type CreateTileDialogProps = {
	folderId: string;
	onCreateFolder: (folderName: string) => void;
	onCreateDefaultWidget: (defaultWidgetId: DefaultWidgetId) => void;
	onCreateCustomWidget: (zipPath: string) => void;
};

export type CreateTilePages = 'start' | 'folder' | 'widgets' | 'custom_widget';

export type CreateTileContext = CreateTileDialogProps;

export default function CreateTileDialog({
	folderId,
	onCreateFolder,
	onCreateCustomWidget,
	onCreateDefaultWidget,
}: CreateTileDialogProps) {
	const [page, setPage] = useState<CreateTilePages>(
		folderId === 'main' ? 'start' : 'widgets',
	);
	const { setTitle, setOnBack } = useDialog();

	useEffect(() => {
		switch (page) {
			case 'folder':
				setTitle('Create New Folder');
				setOnBack(() => {
					setPage('start');
				});
				break;
			case 'widgets':
				setTitle('Create New Widget');
				if (folderId === 'main') {
					setOnBack(() => {
						setPage('start');
					});
				}
				break;
			case 'custom_widget':
				setTitle('Import Custom Widget');
				setOnBack(() => {
					setPage('widgets');
				});
				break;
			case 'start':
			default:
				setTitle('Create New...');
				setOnBack(undefined);
		}
	}, [page]);

	return (
		<DialogContent className='flex flex-col'>
			<div className='max-h-128 overflow-y-auto p-4'>
				<PageContextProvider<CreateTileContext>
					folderId={folderId}
					onCreateDefaultWidget={onCreateDefaultWidget}
					onCreateFolder={onCreateFolder}
					onCreateCustomWidget={onCreateCustomWidget}
				>
					<PageProvider<CreateTilePages> page={page} setPage={setPage}>
						<CreatePage />
					</PageProvider>
				</PageContextProvider>
			</div>
		</DialogContent>
	);
}

function CreatePage() {
	const { page } = usePage<CreateTilePages>();

	switch (page) {
		case 'start':
			return <CreateStartPage />;
		case 'widgets':
			return <CreateWidgetPage />;
		case 'folder':
			return <CreateFolderPage />;
		case 'custom_widget':
			return <CreateCustomWidget />;
		default:
			return <p>missing!</p>;
	}
}

{
	/* <CreateButton
						className='rounded-slime'
						onClick={async () => {
							const id = await installDefaultWidget('twitch-chat');
							addTile({ id, index, folderId });
							closeDialog();
						}}
					>
						Twitch Chat Widget
					</CreateButton>

					<CreateButton
						className='rounded-slime'
						onClick={async () => {
							const id = await installDefaultWidget('twitch-command-bot');
							addTile({ id, index, folderId });
							closeDialog();
						}}
					>
						Twitch Command Bot Widget
					</CreateButton>

					<CreateButton
						className='rounded-slime'
						onClick={async () => {
							const zipPath = await openZip();
							if (!zipPath) return;

							const id = await installCustomWidget(zipPath);
							addTile({ id, index, folderId });
							closeDialog();
						}}
					>
						Custom Widget
					</CreateButton>

					{folderId === 'main' && (
						<CreateButton
							className='rounded-10%'
							onClick={async () => {
								const id = await createWidgetFolder();
								addTile({
									id,
									index,
									folderId,
								});
								closeDialog();
							}}
						>
							Folder
						</CreateButton>
					)} */
}
