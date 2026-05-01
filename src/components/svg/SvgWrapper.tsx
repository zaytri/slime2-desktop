import clsx from 'clsx';

export default function SvgWrapper({
	className,
	children,
}: Props.WithClassNameAndChildren) {
	return <div className={clsx('flex', className)}>{children}</div>;
}
