import clsx from 'clsx';
import Linkify from 'linkify-react';
import { memo } from 'react';
import ExternalLink from './ExternalLink';

type LinkifyTextProps = {
	linkClassName?: string;
};

const LinkifyText = memo(function LinkifyText(
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
			className={clsx('break-words', className)}
			as='p'
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
});

export default LinkifyText;
