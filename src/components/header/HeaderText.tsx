import clsx from 'clsx';
import { memo } from 'react';

const HeaderText = memo(function HeaderText({
	children,
	className,
}: Props.WithClassNameAndChildren) {
	return (
		<h1
			className={clsx(
				'font-fredoka truncate text-4xl font-medium text-amber-900',
				className,
			)}
		>
			{children}
		</h1>
	);
});

export default HeaderText;
