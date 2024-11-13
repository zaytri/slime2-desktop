import clsx from 'clsx';
import { memo } from 'react';

export default memo(function HeaderText({
	children,
	className,
}: Props.WithClassNameAndChildren) {
	return (
		<h1
			className={clsx(
				'font-fredoka text-4xl font-medium text-amber-900',
				className,
			)}
		>
			{children}
		</h1>
	);
});
