import type { Options as DocsPluginOptions } from '@docusaurus/plugin-content-docs';
import type { Options as PagesPluginOptions } from '@docusaurus/plugin-content-pages';
import type { Options as SitemapPluginOptions } from '@docusaurus/plugin-sitemap';
import type { Options as ThemeClassicPluginOptions } from '@docusaurus/theme-classic';
import type { Config } from '@docusaurus/types';
import type { PluginOptions as LocalSearchPluginOptions } from '@easyops-cn/docusaurus-search-local';
import postcssTailwind from '@tailwindcss/postcss';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
	title: 'Slime2 Docs',
	titleDelimiter: '🧪',
	url: 'https://docs.slime2.stream',
	baseUrl: '/',

	tagline: 'How to use Slime2',
	favicon: 'img/favicon.ico',

	// Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
	future: {
		v4: true, // Improve compatibility with the upcoming Docusaurus v4
	},

	// GitHub pages deployment config.
	organizationName: 'zaytri',
	projectName: 'slime2-desktop',

	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
	},

	// configure theme plugins
	themes: [
		[
			'@easyops-cn/docusaurus-search-local',
			{
				indexDocs: true,
				indexPages: true,
				indexBlog: false,
				language: ['en'],
				hashed: true,
			} satisfies LocalSearchPluginOptions,
		],
	],

	// configure plugins
	plugins: [
		function tailwindPlugin(_context, _options) {
			return {
				name: 'tailwind-plugin',
				configurePostCss(options) {
					options.plugins = [postcssTailwind];
					return options;
				},
			};
		},
		[
			'@docusaurus/theme-classic',
			{
				customCss: ['./src/css/custom.css'],
			} satisfies ThemeClassicPluginOptions,
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				sidebarPath: './sidebars.ts',
				showLastUpdateTime: true,
			} satisfies DocsPluginOptions,
		],
		[
			'@docusaurus/plugin-content-pages',
			{ showLastUpdateTime: true } satisfies PagesPluginOptions,
		],
		['@docusaurus/plugin-sitemap', {} satisfies SitemapPluginOptions],
	],

	themeConfig: {
		image: undefined, // social card image
		colorMode: {
			respectPrefersColorScheme: true,
		},
		navbar: {
			title: 'Slime2 Documentation',
			logo: {
				alt: 'Slime2 Logo',
				src: 'img/logo.png',
			},
			items: [
				{
					type: 'docSidebar',
					sidebarId: 'tutorialSidebar',
					position: 'left',
					label: 'Tutorial',
				},
				{
					type: 'docSidebar',
					sidebarId: 'devSidebar',
					position: 'left',
					label: 'Widget Development',
				},
				{
					href: 'https://github.com/zaytri/slime2-desktop',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		footer: {
			style: 'dark',
			links: [
				{
					title: 'Docs',
					items: [
						{
							label: 'Tutorial',
							to: '/docs/intro',
						},
					],
				},
				{
					title: 'Community',
					items: [
						{
							label: 'Stack Overflow',
							href: 'https://stackoverflow.com/questions/tagged/docusaurus',
						},
						{
							label: 'Discord',
							href: 'https://discordapp.com/invite/docusaurus',
						},
						{
							label: 'X',
							href: 'https://x.com/docusaurus',
						},
					],
				},
				{
					title: 'More',
					items: [
						{
							label: 'Blog',
							to: '/blog',
						},
						{
							label: 'GitHub',
							href: 'https://github.com/facebook/docusaurus',
						},
					],
				},
			],
			copyright: `Slime2 Dev Docs - Built with Docusaurus v3`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	},
};

export default config;
