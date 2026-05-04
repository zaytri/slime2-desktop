import clsx from 'clsx';

type SvgWrapperProps = {
	useGpuRendering?: boolean;
};

export default function SvgWrapper({
	className,
	children,
	useGpuRendering = true,
}: Props.WithClassNameAndChildren<SvgWrapperProps>) {
	return (
		<div
			className={clsx(
				'flex',
				// prevent fractional pixel issues
				// https://medium.com/design-bootcamp/addressing-sub-pixel-rendering-and-pixel-alignment-issues-in-web-development-cf4adb6ea6ac
				useGpuRendering &&
					'translate-z-0 overflow-hidden will-change-transform',
				className,
			)}
		>
			{children}
		</div>
	);
}
