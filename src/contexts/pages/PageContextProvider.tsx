import { PageContextContext, PageContextState } from './usePageContext';

export default function PageContextProvider<C = never>({
	children,
	...context
}: Props.WithChildren<PageContextState<C>>) {
	return <PageContextContext value={context}>{children}</PageContextContext>;
}
