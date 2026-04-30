import { memo } from 'react';
import SvgWrapper from './SvgWrapper';

const GridSvg = memo(function GridSvg({ className }: Props.WithClassName) {
	return (
		<SvgWrapper className={className}>
			<svg
				shapeRendering='geometricPrecision'
				textRendering='geometricPrecision'
				imageRendering='optimizeQuality'
				fillRule='evenodd'
				clipRule='evenodd'
				viewBox='0 0 512 481.157'
				fill='currentColor'
			>
				<path d='M35.64 0h159.702c19.604 0 35.641 16.037 35.641 35.64v145.308c0 19.604-16.037 35.64-35.641 35.64H35.64c-19.603 0-35.64-16.036-35.64-35.64V35.64C0 16.037 16.037 0 35.64 0zm281.017 264.569h159.702c19.604 0 35.641 16.036 35.641 35.64v145.307c0 19.604-16.037 35.641-35.641 35.641H316.657c-19.603 0-35.64-16.037-35.64-35.641V300.209c0-19.604 16.037-35.64 35.64-35.64zm-281.017 0h159.702c19.604 0 35.641 16.036 35.641 35.64v145.307c0 19.604-16.037 35.641-35.641 35.641H35.64C16.037 481.157 0 465.12 0 445.516V300.209c0-19.604 16.037-35.64 35.64-35.64zM316.657 0h159.702C495.963 0 512 16.037 512 35.64v145.308c0 19.604-16.037 35.64-35.641 35.64H316.657c-19.603 0-35.64-16.036-35.64-35.64V35.64c0-19.603 16.037-35.64 35.64-35.64z' />
			</svg>
		</SvgWrapper>
	);
});

export default GridSvg;
