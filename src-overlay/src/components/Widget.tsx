import { useLoaderData } from '@tanstack/react-router';
import { useEffect } from 'react';
import useMetaLoader from '../hooks/useMetaLoader';
import useSlime2Websocket from '../hooks/useSlime2Websocket';

export default function Widget() {
	const { html, dark } = useLoaderData({ from: '/$' });
	useMetaLoader();
	useSlime2Websocket();

	useEffect(() => {
		document.body.classList.toggle('dark', dark);
	}, [dark]);

	return (
		<main id='slime2-widget' dangerouslySetInnerHTML={{ __html: html }}></main>
	);
}
