import { useSystemFontsQuery } from '@/hooks/useSystemFontsQuery';

// helps to load fonts before the font picker needs them

export default function FontLoader() {
	const { data } = useSystemFontsQuery();

	return (
		<div
			aria-hidden
			className='absolute inset-0 -z-50 flex flex-col overflow-hidden opacity-5'
		>
			{data.map(font => {
				return (
					<div
						key={font}
						aria-hidden
						className='flex gap-8 px-3 py-1'
						style={{ fontFamily: `${font}, sans-serif` }}
					>
						<p className='flex-1 text-nowrap' aria-hidden>
							{font}
						</p>
						<p className='flex-1 truncate'>
							0123456789 Lorem ipsum dolor sit amet, consectetur adipiscing
							elit, sed do eiusmod tempor incididunt ut labore et dolore magna
							aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
							laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
							dolor in reprehenderit in voluptate velit esse cillum dolore eu
							fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
							proident, sunt in culpa qui officia deserunt mollit anim id est
							laborum
						</p>
					</div>
				);
			})}
		</div>
	);
}
