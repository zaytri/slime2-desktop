import FileDropper from '@/components/FileDropper';
import { extractWidgetDetails } from '@/helpers/commands';
import { createLazyFileRoute } from '@tanstack/react-router';
export const Route = createLazyFileRoute('/settings')({
	component: Settings,
	pendingComponent: () => <div>loading...</div>,
});
function Settings() {
	return (
		<>
			<div className='p-2'>Settings!</div>
			<FileDropper
				onFileDrop={async fileDropEvent => {
					if (fileDropEvent.type === 'drop') {
						const details = await extractWidgetDetails(
							fileDropEvent.paths[0],
						).catch(error => error);
						console.log(details);
					}
				}}
			/>
		</>
	);
}
