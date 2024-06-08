import { createLazyFileRoute } from '@tanstack/react-router';
export const Route = createLazyFileRoute('/settings')({
  component: Settings,
  pendingComponent: () => <div>loading...</div>,
});
function Settings() {
  return <div className='p-2'>Settings!</div>;
}
