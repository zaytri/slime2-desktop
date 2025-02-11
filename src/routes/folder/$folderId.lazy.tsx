import Folder from '@/routes/folder/-components/Folder';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/folder/$folderId')({
	component: () => {
		const { folderId } = Route.useParams();
		return <Folder folderId={folderId} />;
	},
});
