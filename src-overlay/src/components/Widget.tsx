import { useLoaderData } from '@tanstack/react-router';
import useMetaLoader from '../hooks/useMetaLoader';
import useSlime2Websocket from '../hooks/useSlime2Websocket';

export default function Widget() {
	const { html } = useLoaderData({ from: '/$' });
	useMetaLoader();
	useSlime2Websocket();

	return (
		<main id='slime2-widget' dangerouslySetInnerHTML={{ __html: html }}></main>
	);
}
