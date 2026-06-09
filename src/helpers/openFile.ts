import {
	open,
	type DialogFilter,
	type OpenDialogOptions,
} from '@tauri-apps/plugin-dialog';

export type MediaType = 'audio' | 'image' | 'video';

export async function openImage(
	options?: Omit<OpenDialogOptions, 'multiple'>,
): Promise<null | string> {
	return open({
		title: 'Choose Image File',
		filters: [DEFAULT_IMAGE_FILTER],
		...options,
	});
}

export async function openImageMultiple(
	options?: Omit<OpenDialogOptions, 'multiple'>,
): Promise<null | string[]> {
	return open({
		title: 'Choose Image Files',
		filters: [DEFAULT_IMAGE_FILTER],
		multiple: true,
		...options,
	});
}

export async function openVideo(
	options?: Omit<OpenDialogOptions, 'multiple'>,
): Promise<null | string> {
	return open({
		title: 'Choose Video File',
		filters: [DEFAULT_VIDEO_FILTER],
		...options,
	});
}

export async function openVideoMultiple(
	options?: Omit<OpenDialogOptions, 'multiple'>,
): Promise<null | string[]> {
	return open({
		title: 'Choose Video Files',
		filters: [DEFAULT_VIDEO_FILTER],
		multiple: true,
		...options,
	});
}

export async function openAudio(
	options?: Omit<OpenDialogOptions, 'multiple'>,
): Promise<null | string> {
	return open({
		title: 'Choose Audio File',
		filters: [DEFAULT_AUDIO_FILTER],
		...options,
	});
}

export async function openAudioMultiple(
	options?: Omit<OpenDialogOptions, 'multiple'>,
): Promise<null | string[]> {
	return open({
		title: 'Choose Audio Files',
		filters: [DEFAULT_AUDIO_FILTER],
		multiple: true,
		...options,
	});
}

export async function openZip(
	options?: Omit<OpenDialogOptions, 'multiple'>,
): Promise<null | string> {
	return open({
		title: 'Import Widget ZIP',
		filters: [
			{
				name: 'Zip File',
				extensions: ['zip'],
			},
		],
		...options,
	});
}

export function getMediaFormats(type: MediaType): string[] {
	switch (type) {
		case 'image':
			return IMAGE_FORMATS;
		case 'video':
			return VIDEO_FORMATS;
		case 'audio':
			return AUDIO_FORMATS;
		default:
			return [];
	}
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

const DEFAULT_IMAGE_FILTER: DialogFilter = {
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

const DEFAULT_VIDEO_FILTER: DialogFilter = {
	name: 'Video Files',
	extensions: [...VIDEO_FORMATS.map(format => format.toLowerCase())],
};

export const AUDIO_FORMATS = ['MP3', 'WAV'];

const DEFAULT_AUDIO_FILTER: DialogFilter = {
	name: 'Audio Files',
	extensions: [...AUDIO_FORMATS.map(format => format.toLowerCase())],
};
