import { PageContext, PageState } from './usePage';

export default function PageProvider<P extends string = never>({
	page,
	setPage,
	children,
}: Props.WithChildren<PageState<P>>) {
	return <PageContext value={{ page, setPage }}>{children}</PageContext>;
}
