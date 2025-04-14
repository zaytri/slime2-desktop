import { Link, LinkComponentProps } from '@tanstack/react-router';
import { memo, PropsWithChildren } from 'react';

type HeaderButtonProps = {
	icon: React.ReactNode;
	onClick?: VoidFunction;
	linkTo?: LinkComponentProps['to'];
	linkParams?: LinkComponentProps['params'];
};

const HeaderButton = memo(function HeaderButton({
	onClick,
	linkTo,
	linkParams,
	children,
	icon,
}: PropsWithChildren<HeaderButtonProps>) {
	const className =
		'group over:gap-2 over:bg-amber-900 over:text-amber-200 over:px-2 flex h-10 items-center justify-center gap-0 rounded-lg text-amber-900';

	const buttonChildren = (
		<>
			{icon}
			<span className='group-over:text-lg group-over:opacity-100 text-[.1px] text-nowrap opacity-0 transition-[font-size]'>
				{children}
			</span>
		</>
	);

	return linkTo ? (
		<Link to={linkTo} params={linkParams} className={className}>
			{buttonChildren}
		</Link>
	) : (
		<button type='button' className={className} onClick={onClick}>
			{buttonChildren}
		</button>
	);
});

export default HeaderButton;
