import { openUrl } from '@tauri-apps/plugin-opener';
import { memo } from 'react';

type ExternalLinkProps = {
	href: string;
	onClick?: React.DOMAttributes<HTMLButtonElement>['onClick'];
};

const ExternalLink = memo(function ExternalLink({
	href,
	onClick,
	children,
	className,
}: Props.WithClassNameAndChildren<ExternalLinkProps>) {
	return (
		<button
			type='button'
			className={className}
			onClick={event => {
				if (onClick) {
					onClick(event);
				}
				openUrl(href);
			}}
		>
			{children}
		</button>
	);
});

export default ExternalLink;
