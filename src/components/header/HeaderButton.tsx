import { Link, LinkComponentProps, useRouter } from '@tanstack/react-router';
import { memo, PropsWithChildren } from 'react';

type HeaderButtonProps = {
	icon: React.ReactNode;
	onClick?: VoidFunction;
	back?: boolean;
	linkTo?: LinkComponentProps['to'];
	linkParams?: LinkComponentProps['params'];
	externalHref?: string;
};

const HeaderButton = memo(function HeaderButton({
	onClick,
	back,
	linkTo,
	linkParams,
	externalHref,
	children,
	icon,
}: PropsWithChildren<HeaderButtonProps>) {
	const router = useRouter();

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

	// https://github.com/TanStack/router/discussions/181#discussioncomment-12718709
	if (back) {
		return (
			<Link
				to='/'
				onClick={event => {
					event.preventDefault();
					router.history.back();
					return false;
				}}
				className={className}
			>
				{buttonChildren}
			</Link>
		);
	}

	if (linkTo) {
		return (
			<Link to={linkTo} params={linkParams} className={className}>
				{buttonChildren}
			</Link>
		);
	}

	if (externalHref) {
		return (
			<a href={externalHref} target='_blank' className={className}>
				{buttonChildren}
			</a>
		);
	}

	return (
		<button type='button' className={className} onClick={onClick}>
			{buttonChildren}
		</button>
	);
});

export default HeaderButton;
