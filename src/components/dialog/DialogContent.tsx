import clsx from 'clsx';
import { memo } from 'react';

const DialogContent = memo(function DialogContent({
	className,
	children,
}: Props.WithClassNameAndChildren) {
	return (
		//
		//! add wave to dialog bg?
		//
		<div
			className={clsx(
				'mx-0.5 flex-1 overflow-hidden rounded-b-3 border border-white bg-zinc-100 bg-linear-to-br from-zinc-200 to-zinc-50 outline-2 outline-black/25',
				className,
			)}
		>
			{children}
		</div>
	);
});

export default DialogContent;
