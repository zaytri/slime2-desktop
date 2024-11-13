import clsx from 'clsx';
import { memo } from 'react';

export default memo(function Header({
	children,
	className,
}: Props.WithClassNameAndChildren) {
	return (
		<div
			className={clsx(
				'flex border-b-4 border-amber-900 bg-gradient-to-r from-amber-200 to-amber-300',
				className,
			)}
		>
			{children}
		</div>
	);
});
