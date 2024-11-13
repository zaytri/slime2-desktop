import { memo } from 'react';

export default memo(function DialogHeader({ children }: Props.WithChildren) {
	return <h2 className='mb-4 mt-0.5 text-2xl font-semibold'>{children}</h2>;
});
