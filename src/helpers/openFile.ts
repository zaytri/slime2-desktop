import { open } from '@tauri-apps/plugin-dialog';

export async function openImage(): Promise<null | string> {
	return open({
		title: 'Choose Image File',
		filters: [IMAGE_FILTER],
	});
}

export async function openImageMultiple(): Promise<null | string[]> {
	return open({
		title: 'Choose Image Files',
		filters: [IMAGE_FILTER],
		multiple: true,
	});
}

export async function openVideo(): Promise<null | string> {
	return open({
		title: 'Choose Video File',
		filters: [VIDEO_FILTER],
	});
}

export async function openVideoMultiple(): Promise<null | string[]> {
	return open({
		title: 'Choose Video Files',
		filters: [VIDEO_FILTER],
		multiple: true,
	});
}

export async function openAudio(): Promise<null | string> {
	return open({
		title: 'Choose Audio File',
		filters: [AUDIO_FILTER],
	});
}

export async function openAudioMultiple(): Promise<null | string[]> {
	return open({
		title: 'Choose Audio Files',
		filters: [AUDIO_FILTER],
		multiple: true,
	});
}

export const IMAGE_FORMATS = [
	'JPEG',
	'PNG',
	'GIF',
	'WEBP',
	'APNG',
	'AVIF',
	'SVG',
];

const IMAGE_FILTER = {
	name: 'Image Files',
	extensions: [
		...IMAGE_FORMATS.map(format => format.toLowerCase()),
		// other extensions for jpg
		'jpeg',
		'jfif',
		'pjpeg',
		'pjp',
	],
};

export const VIDEO_FORMATS = ['MP4', 'WEBM'];

const VIDEO_FILTER = {
	name: 'Video Files',
	extensions: [...VIDEO_FORMATS.map(format => format.toLowerCase())],
};

export const AUDIO_FORMATS = ['MP3', 'WAV'];

const AUDIO_FILTER = {
	name: 'Audio Files',
	extensions: [...AUDIO_FORMATS.map(format => format.toLowerCase())],
};
