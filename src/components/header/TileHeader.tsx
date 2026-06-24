import clsx from 'clsx';
import HeaderBackButton from './HeaderBackButton';
import HeaderIcon from './HeaderIcon';

type TileHeaderContentsProps = {
	onBack: VoidFunction;
	iconSrc?: string;
	name: string;
};

export default function TileHeader({
	onBack,
	iconSrc,
	name,
	className,
	children,
}: Props.WithClassNameAndChildren<TileHeaderContentsProps>) {
	return (
		<header className={clsx('flex items-center gap-3', className)}>
			<HeaderBackButton onClick={onBack} />

			{iconSrc && <HeaderIcon src={iconSrc} />}

			<h1 className='line-clamp-1 flex-1 font-mochiy text-5 break-all text-white text-shadow-[0_2px_black]'>
				{name}
			</h1>

			{children}
		</header>
	);
}
