import Folder from '@/components/folder/Folder';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/')({
	component: () => <Folder folderId='main' />,
});
