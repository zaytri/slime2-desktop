import { openUrl } from '@tauri-apps/plugin-opener';

type ExternalLinkProps = {
	href: string;
	onClick?: React.DOMAttributes<HTMLButtonElement>['onClick'];
};

export default function ExternalLink({
	href,
	onClick,
	children,
	className,
}: Props.WithClassNameAndChildren<ExternalLinkProps>) {
	return (
		<button
			type='button'
			role='link'
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
}
