import { memo } from 'react';

const DialogHeader = memo(function DialogHeader({
	children,
}: Props.WithChildren) {
	return <h2 className='mt-0.5 mb-4 text-2xl font-semibold'>{children}</h2>;
});

export default DialogHeader;
