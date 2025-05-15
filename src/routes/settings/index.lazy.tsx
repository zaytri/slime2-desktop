import { createLazyFileRoute } from '@tanstack/react-router';
import Settings from './-components/Settings';

export const Route = createLazyFileRoute('/settings/')({
	component: Settings,
});
