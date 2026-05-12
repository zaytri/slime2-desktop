import { loadSystemFonts } from '@/helpers/commands';
import { useQuery } from '@tanstack/react-query';

export function useSystemFontsQuery() {
	return useQuery({
		queryKey: ['systemFonts'],
		queryFn: preloadFonts,
		networkMode: 'always',
	});
}

async function preloadFonts(): Promise<string[]> {
	document.fonts.clear();
	const systemFontDatas = await loadSystemFonts();
	const fontFamilySet = new Set<string>();
	const postscriptNameSet = new Set<string>();
	const fontFaceDatas: {
		family: string;
		fullName: string;
		descriptors: FontFaceDescriptors;
	}[] = [];

	systemFontDatas.forEach(fontData => {
		// ignore duplicate postscript names
		if (postscriptNameSet.has(fontData.postscript_name)) return;

		fontFaceDatas.push({
			family: fontData.family_name,
			fullName: fontData.full_name,
			descriptors: {
				style: fontData.properties.style.toLowerCase(),
				weight: fontData.properties.weight.toString(),
				stretch: `${fontData.properties.stretch * 100}%`,
			},
		});

		postscriptNameSet.add(fontData.postscript_name);
	});

	await Promise.all(
		fontFaceDatas.map(async fontFaceData => {
			try {
				const { family, fullName, descriptors } = fontFaceData;
				const fontFace = new FontFace(
					family,
					`local("${fullName}")`,
					descriptors,
				);
				await fontFace.load();
				document.fonts.add(fontFace);
				fontFamilySet.add(family);
			} catch (error) {
				console.error('Error loading FontFace', fontFaceData, error);
			}
		}),
	);

	const fontFamilies = [...fontFamilySet.values()];
	return fontFamilies.sort((a, b) => {
		return a.toLocaleUpperCase().localeCompare(b.toLocaleUpperCase());
	});
}
