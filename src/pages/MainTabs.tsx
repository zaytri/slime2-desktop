import MoveModeBanner from '@/components/MoveModeBanner';
import GearSvg from '@/components/svg/GearSvg';
import GridSvg from '@/components/svg/GridSvg';
import UserSvg from '@/components/svg/UserSvg';
import WaveSvg from '@/components/svg/WaveSvg';
import TabPanelWithPrevious from '@/components/TabPanelWithPrevious';
import useAccounts from '@/contexts/accounts/useAccounts';
import { useFolderId } from '@/contexts/folder_id/useFolderId';
import { useSettings } from '@/contexts/settings/useSettings';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import useTileSwap from '@/contexts/tile_swap/useTileSwap';
import useUpdate from '@/contexts/update/useUpdate';
import WidgetsPanelProvider from '@/contexts/widgets_panel/WidgetsPanelProvider';
import { TileColor } from '@/helpers/tileColors';
import { useSystemFontsQuery } from '@/hooks/useSystemFontsQuery';
import useTwitchBot from '@/hooks/useTwitchBot';
import useTwitchWebsocket from '@/hooks/useTwitchWebsocket';
import { useUnsuspender } from '@/hooks/useUnsuspender';
import useWidgetCoreChange from '@/hooks/useWidgetCoreChange';
import useWidgetRegistration from '@/hooks/useWidgetRegistration';
import useWidgetRequest from '@/hooks/useWidgetRequest';
import PaperAirplaneSvg from '@@/svg/PaperAirplaneSvg';
import type { TabPanelProps, TabProps } from '@ariakit/react';
import { Tab, TabList, TabProvider } from '@ariakit/react';
import clsx from 'clsx';
import { type ComponentRef, forwardRef, useState } from 'react';
import AccountsPanel from './accounts/AccountsPanel';
import SettingsPanel from './settings/SettingsPanel';
import SimulatorPanel from './simulator/SimulatorPanel';
import WidgetsPanel from './widgets/WidgetsPanel';

export default function MainTabsWrapper() {
	return (
		<MainTabsHooksWrapper>
			<MainTabs />
		</MainTabsHooksWrapper>
	);
}

function MainTabsHooksWrapper({ children }: Props.WithChildren) {
	useUnsuspender();
	useSystemFontsQuery();
	useWidgetRegistration();
	useWidgetRequest();
	useWidgetCoreChange();
	useTwitchWebsocket();
	useTwitchBot();

	return children;
}

function MainTabs() {
	const [selectedId, setSelectedId] = useState<string | null | undefined>('1');
	const { folderId } = useFolderId();
	const { tileMeta } = useTileMeta(folderId);
	const { settings } = useSettings();
	const { sourceSlot, setSourceSlot } = useTileSwap();
	const movingTileMode = !!sourceSlot;

	return (
		<TabProvider setSelectedId={setSelectedId}>
			<div
				className={clsx(
					'relative flex w-full flex-1 flex-col items-stretch overflow-hidden bg-zinc-800',
					settings.disableAnimations && 'disable-animations',
				)}
			>
				<div className='relative flex pt-6'>
					<TabList
						render={<nav />}
						className='flex h-14 flex-1 items-end gap-3 px-7'
					>
						<StyledTab
							disabled={movingTileMode}
							id='1'
							icon={GridSvg}
							className='bg-linear-to-b from-lime-400 to-green-500 text-green-950'
						>
							Widgets
						</StyledTab>
						<StyledTab
							disabled={movingTileMode}
							id='2'
							icon={UserSvg}
							className='bg-linear-to-b from-rose-300 to-pink-300 text-pink-950'
						>
							Accounts
							<AccountsNotificationDot />
						</StyledTab>
						<StyledTab
							disabled={movingTileMode}
							id='3'
							icon={GearSvg}
							className='bg-linear-to-b from-cyan-300 to-sky-400 text-sky-950'
						>
							Settings
							<SettingsNotificationDot />
						</StyledTab>
						<StyledTab
							disabled={movingTileMode}
							id='4'
							icon={PaperAirplaneSvg}
							className='bg-linear-to-b from-yellow-400 to-amber-400 text-amber-950'
						>
							Simulator
						</StyledTab>
					</TabList>

					{/* Moving Tile Mode Banner */}
					{sourceSlot && (
						<MoveModeBanner
							slotId={sourceSlot.id}
							onEscape={() => {
								setSourceSlot(null);
							}}
						/>
					)}
				</div>
				<div
					className={clsx(
						'flex flex-1 overflow-hidden rounded-t-4 bg-linear-to-b p-3 transition-colors',
						selectedId === '1' && 'from-green-500 to-lime-500',
						selectedId === '2' && 'from-pink-300 to-rose-300',
						selectedId === '3' && 'from-sky-400 to-cyan-300',
						selectedId === '4' && 'from-amber-400 to-yellow-300',
						selectedId === '5' && 'from-purple-400 to-violet-400',
					)}
				>
					<div
						className={clsx(
							'relative flex flex-1 overflow-hidden rounded-2 bg-linear-to-br ring-2 inset-shadow-[0_5px_5px_#0003] ring-zinc-800/50 outline outline-offset-2 outline-white/35',
							selectedId === '1' && {
								['bg-rose-300 from-pink-900/50 to-rose-700/50']:
									tileMeta.color === TileColor.Pink,
								['bg-red-300 from-red-900/50 to-red-700/50']:
									tileMeta.color === TileColor.Red,
								['bg-orange-300 from-orange-900/50 to-amber-700/50']:
									tileMeta.color === TileColor.Orange,
								['bg-yellow-300 from-amber-900/50 to-yellow-700/50']:
									tileMeta.color === TileColor.Yellow,
								['from-green-700 to-lime-600']:
									tileMeta.color === TileColor.Green,
								['from-emerald-700 to-teal-600']:
									tileMeta.color === TileColor.Teal,
								['from-sky-700 to-cyan-600']: tileMeta.color === TileColor.Blue,
								['bg-violet-400 from-purple-950/50 to-violet-700/40']:
									tileMeta.color === TileColor.Purple,
							},
							selectedId === '2' &&
								'bg-rose-300 from-pink-900/50 to-rose-700/50',
							selectedId === '3' && 'from-sky-700 to-cyan-600',
							selectedId === '4' &&
								'bg-yellow-300 from-amber-900/50 to-yellow-700/50',
							selectedId === '5' &&
								'bg-violet-400 from-purple-950/50 to-violet-700/40',
						)}
					>
						<div className='absolute inset-0 bg-black text-white opacity-10 mix-blend-overlay'>
							<WaveSvg className='-translate-y-25' />
						</div>
						<StyledPanel tabId='1'>
							<WidgetsPanelProvider>
								<WidgetsPanel />
							</WidgetsPanelProvider>
						</StyledPanel>
						<StyledPanel tabId='2'>
							<AccountsPanel />
						</StyledPanel>
						<StyledPanel tabId='3'>
							<SettingsPanel />
						</StyledPanel>
						<StyledPanel tabId='4'>
							<SimulatorPanel />
						</StyledPanel>
					</div>
				</div>
			</div>
		</TabProvider>
	);
}

const StyledTab = forwardRef<
	ComponentRef<typeof Tab>,
	TabProps & { icon: SvgComponent }
>(function StyledTab(props, ref) {
	const { children, className, icon: Icon, ...rest } = props;

	if (rest.disabled) {
		rest.tabIndex = -1;
	}

	return (
		<Tab
			ref={ref}
			{...rest}
			className={clsx(
				'group relative flex h-10 flex-1 overflow-hidden rounded-t-4 border border-white/50 border-b-zinc-800 px-4 py-1 text-left text-5 transition-[height] ease-out focus-visible:outline-4 focus-visible:outline-offset-4! focus-visible:outline-white aria-selected:h-full aria-selected:border-b-0 aria-selected:text-7 over:h-full',
				props.className,
			)}
		>
			<div className='absolute inset-0 bottom-[45%] bg-linear-to-b from-white/30 to-white/20'></div>
			<div className='flex flex-1 items-center gap-3 drop-shadow-[0_0_5px_#FFFB]'>
				<Icon className='-mb-px h-5 group-aria-selected:-mb-0.5 group-aria-selected:h-7'></Icon>
				<div className='font-mochiy'>{children}</div>
			</div>
		</Tab>
	);
});

const StyledPanel = forwardRef<
	ComponentRef<typeof TabPanelWithPrevious>,
	TabPanelProps
>(function StyledPanel(props, ref) {
	const { children, className, ...rest } = props;
	return (
		<TabPanelWithPrevious
			ref={ref}
			{...rest}
			className='animated-tab-panel flex w-full flex-1'
			render={<section />}
			focusable={false}
		>
			{children}
		</TabPanelWithPrevious>
	);
});

function AccountsNotificationDot() {
	const accounts = useAccounts();
	const accountNeedsReauth = Object.values(accounts).some(account => {
		return account.reauthorize;
	});

	if (accountNeedsReauth) {
		return <NotificationDot className='bg-rose-600' />;
	} else {
		return null;
	}
}

function SettingsNotificationDot() {
	const update = useUpdate();
	if (update) {
		return <NotificationDot className='bg-violet-500' />;
	} else {
		return null;
	}
}

function NotificationDot({ className }: Props.WithClassName) {
	return (
		<div
			className={clsx('absolute top-2 right-0 size-3 rounded-full', className)}
		></div>
	);
}
