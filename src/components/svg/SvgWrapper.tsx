import clsx from 'clsx';
import { memo } from 'react';

const SvgWrapper = memo(function SvgWrapper({
	className,
	children,
}: Props.WithClassNameAndChildren) {
	return <div className={clsx('flex', className)}>{children}</div>;
});

export default SvgWrapper;
