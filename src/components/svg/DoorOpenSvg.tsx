import SvgWrapper from './SvgWrapper';

export default function DoorOpenSvg({ className }: Props.WithClassName) {
	return (
		<SvgWrapper className={className}>
			<svg fill='currentColor' viewBox='0 0 81.83 122.88'>
				<path
					fillRule='evenodd'
					d='M59.88,0,2.9,8.54A3.65,3.65,0,0,0,0,12V112.48c0,1.63,1.29,2.25,2.9,2.48l57,7.9c1.6.22,2.89-1.86,2.89-3.51V2.5A2.43,2.43,0,0,0,59.88,0Zm9,115.44a2.43,2.43,0,1,1,0-4.86H76.5a.5.5,0,0,0,.33-.14.47.47,0,0,0,.13-.33V12.56a.49.49,0,0,0-.13-.33.51.51,0,0,0-.33-.13H68.92a2.44,2.44,0,1,1,0-4.87H76.5a5.36,5.36,0,0,1,5.33,5.33v97.58a5.34,5.34,0,0,1-5.33,5.33ZM55.33,53.9l-4.76-1.36v17.8l4.76-1.72V53.9Z'
				/>
			</svg>
		</SvgWrapper>
	);
}
