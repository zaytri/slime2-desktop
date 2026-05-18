import HeaderButton from '@/components/header/HeaderButton';
import TileHeader from '@/components/header/TileHeader';
import useBotLog from '@/contexts/bot_logs/useBotLog';
import type { BotLogLevel } from '@/contexts/bot_logs/useBotLogsDispatch';
import { deepCopyObject } from '@/contexts/common';
import { useWidgetId } from '@/contexts/widget_id/useWidgetId';
import { scrollToElement } from '@/helpers/scroll';
import TrashSvg from '@@/svg/TrashSvg';
import TriangleDownSvg from '@@/svg/TriangleDownSvg';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

type WidgetBotLogsProps = {
	onBack: VoidFunction;
};

const SCROLL_ID = 'slime2-bot-log-container';

export default function WidgetBotLogs({ onBack }: WidgetBotLogsProps) {
	const widgetId = useWidgetId();
	const { botLog, clearLog } = useBotLog(widgetId);
	const [lastClicked, setLastClicked] = useState<string | null>(null);
	const logReverse = deepCopyObject(botLog).reverse();

	return (
		<div className='flex w-full flex-1 p-4'>
			<div className='flex flex-1 flex-col gap-4 overflow-hidden dark-container p-6 pt-4'>
				<TileHeader className='-ml-2' onBack={onBack} name='Bot Logs'>
					<HeaderButton
						label='Clear Logs'
						icon={TrashSvg}
						onClick={clearLog}
						className='border-yellow-300 bg-yellow-300 from-yellow-300 to-amber-400 text-amber-900 over:outline-yellow-600'
					/>
				</TileHeader>

				<div className='flex flex-1 overflow-hidden rounded-2 border-2 border-zinc-500 bg-zinc-900/50 inset-shadow-[0_0_20px_#0004]'>
					<div
						id={SCROLL_ID}
						className='flex flex-1 flex-col-reverse gap-1 overflow-auto px-2 py-3'
					>
						<div className='flex-1'></div>
						{logReverse.map(log => {
							return (
								<LogLine
									key={log.id}
									level={log.level}
									message={log.message}
									highlighted={log.id === lastClicked}
									onClick={() => {
										setLastClicked(log.id);
									}}
								/>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

type LogLineProps = {
	highlighted: boolean;
	onClick: VoidFunction;
	level: BotLogLevel;
	message: string;
};

function LogLine({ level, message, onClick, highlighted }: LogLineProps) {
	const [collapsed, setCollapsed] = useState<boolean>(true);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		scrollToElement(document.getElementById(SCROLL_ID), containerRef.current);
	}, [collapsed]);

	return (
		<div
			ref={containerRef}
			className={clsx(
				'group text-rose-2100 relative flex shrink-0 gap-1 overflow-hidden rounded-1 bg-zinc-400/10 px-1 py-0.5 text-zinc-200 -outline-offset-1 outline-white/25 text-shadow-[0_1px_black] over:outline',
				level === 'error' && 'bg-rose-400/40! text-rose-200!',
				level === 'warn' && 'bg-amber-400/30! text-amber-200!',
				highlighted && 'outline',
			)}
			onClick={() => {
				if (getSelection()?.isCollapsed) {
					setCollapsed(!collapsed);
				}
				onClick();
			}}
		>
			<div
				className={clsx(
					'pointer-events-none absolute inset-0 group-over:bg-white/10',
					highlighted && 'bg-white/10',
				)}
			></div>
			{typeof collapsed === 'boolean' && (
				<TriangleDownSvg
					className={clsx('mt-1 size-2.5 shrink-0', collapsed && '-rotate-90')}
				/>
			)}
			<p
				className={clsx(
					'font-mono text-3',
					collapsed ? 'line-clamp-1' : 'whitespace-pre-wrap',
				)}
			>
				{message}
			</p>
		</div>
	);
}
