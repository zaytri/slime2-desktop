import { useDialog } from '@/contexts/dialog/useDialog';
import PageContextProvider from '@/contexts/pages/PageContextProvider';
import PageProvider from '@/contexts/pages/PageProvider';
import { usePage } from '@/contexts/pages/usePage';
import type { WidgetValues } from '@@/json/widgetValues';
import { useEffect, useState } from 'react';
import DialogContent from '../DialogContent';
import CopyPasteWidgetDataStartPage from './CopyPasteWidgetDataStartPage';
import PasteWidgetDataPage from './PasteWidgetDataPage';

export type CopyPasteWidgetDataPages = 'start' | 'import';

type CopyPasteWidgetDataDialogProps = {
	widgetValues: WidgetValues;
	replace: (values: WidgetValues) => void;
};

export type CopyPasteWidgetDataContext = CopyPasteWidgetDataDialogProps;

export default function CopyPasteWidgetDataDialog({
	widgetValues,
	replace,
}: CopyPasteWidgetDataDialogProps) {
	const [page, setPage] = useState<CopyPasteWidgetDataPages>('start');
	const { setTitle, setOnBack } = useDialog();

	useEffect(() => {
		switch (page) {
			case 'start':
				setTitle('Copy/Paste Widget Data');
				setOnBack(undefined);
				break;
			case 'import':
				setTitle('Paste Widget Data');
				setOnBack(() => {
					setPage('start');
				});
		}
	}, [page]);

	return (
		<DialogContent className='flex p-4'>
			<PageContextProvider<CopyPasteWidgetDataContext>
				widgetValues={widgetValues}
				replace={replace}
			>
				<PageProvider page={page} setPage={setPage}>
					<CopyPasteWidgetDataPage />
				</PageProvider>
			</PageContextProvider>
		</DialogContent>
	);
}

function CopyPasteWidgetDataPage() {
	const { page } = usePage<CopyPasteWidgetDataPages>();

	switch (page) {
		case 'start':
			return <CopyPasteWidgetDataStartPage />;
		case 'import':
			return <PasteWidgetDataPage />;
		default:
			return <p>missing!</p>;
	}
}
