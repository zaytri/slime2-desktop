import { open } from '@tauri-apps/plugin-dialog';

const IMAGE_FILTER = {
	name: 'Image Files',
	extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'apng', 'jfif'],
};

export async function openImage(): Promise<null | string> {
	return open({
		title: 'Select Image',
		filters: [IMAGE_FILTER],
	}) as Promise<null | string>;
}

export async function openImages(): Promise<null | string[]> {
	return open({
		title: 'Select Images',
		multiple: true,
		filters: [IMAGE_FILTER],
	}) as Promise<null | string[]>;
}
