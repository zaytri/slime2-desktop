import Folder from '@/routes/folder/-components/Folder';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/')({
	component: () => <Folder folderId='main' />,
});
