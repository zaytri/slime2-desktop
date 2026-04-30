import useWidgetsPanel from '@/contexts/widgets_panel/useWidgetsPanel';
import { TabProvider } from '@ariakit/react';
import FolderHeader from './FolderHeader';
import FolderSidebar from './FolderSidebar';
import WidgetGrid from './WidgetGrid';

export default function Folder() {
	const { page } = useWidgetsPanel();

	return (
		<TabProvider selectedId={page.toString()}>
			<div className='flex flex-1 flex-col gap-4 p-4'>
				<FolderHeader />
				<div className='flex flex-1 gap-8'>
					<FolderSidebar />
					<WidgetGrid />
				</div>
			</div>
		</TabProvider>
	);
}
