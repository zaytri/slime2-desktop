import clsx from 'clsx';
import Linkify from 'linkify-react';
import ExternalLink from './ExternalLink';

type LinkifyTextProps = {
	linkClassName?: string;
};

export default function LinkifyText(
	props: React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLParagraphElement>,
		HTMLParagraphElement
	> &
		LinkifyTextProps,
) {
	const { linkClassName, className, ...rest } = props;

	return (
		<Linkify
			{...rest}
			className={clsx('wrap-break-word', className)}
			as='div'
			options={{
				target: '_blank',
				nl2br: true, // converts \n line breaks to <br> tags
				className: clsx('inline underline', linkClassName),
				render: ({ attributes, content }) => {
					const { href, class: className } = attributes;
					return (
						<ExternalLink href={href} className={className}>
							{content}
						</ExternalLink>
					);
				},
			}}
		/>
	);
}
