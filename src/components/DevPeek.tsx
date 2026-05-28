import { useSettings } from '@/contexts/settings/useSettings';
import useWidgetSettingParent from '@/contexts/widget_setting_parent/useWidgetSettingParent';
import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSetting } from '@@/json/widgetSettings';
import { Tooltip, TooltipAnchor, TooltipProvider } from '@ariakit/react';
import clsx from 'clsx';
import EyeSvg from './svg/EyeSvg';

type DevPeekProps = {
	id: string;
	setting: DistributiveOmit<WidgetSetting.NonCategory, 'label'>;
};

export default function DevPeek({ id, setting }: DevPeekProps) {
	const { settings: appSettings } = useSettings();
	const parentId = useWidgetSettingParent();

	if (!appSettings.devMode) return;

	return (
		<TooltipProvider timeout={0} placement='right'>
			<TooltipAnchor
				className={clsx(
					'absolute -left-5 z-20',
					'settings' in setting ? 'top-4' : 'top-1',
				)}
				render={<button type='button' />}
			>
				<div className='rounded-1 p-1 text-zinc-600 over:bg-zinc-700 over:text-white over:outline over:outline-zinc-800'>
					<span className='sr-only'>Dev Peek</span>
					<EyeSvg className='size-4' />
				</div>
			</TooltipAnchor>

			<Tooltip
				render={<section />}
				fitViewport
				className='dark-menu min-w-0! p-0!'
			>
				<div className='flex flex-col gap-2 overflow-y-auto p-3 pt-2'>
					<h5 className='flex items-center gap-2 font-bold text-zinc-300 uppercase drop-shadow-[0_1px_black]'>
						<EyeSvg className='size-4' />
						Dev Peek
					</h5>

					{parentId && (
						<PeekTag label='Multi-Section ID' value={parentId.split('[')[0]} />
					)}
					<PeekTag label='ID' value={id} />
					{'defaultValue' in setting && (
						<PeekTag
							label='Default Value'
							value={setting.defaultValue ?? null}
						/>
					)}

					{'options' in setting && setting.options.length > 0 && (
						<div className='flex flex-col gap-2'>
							<p className='text-3.5 font-bold text-zinc-300 uppercase text-shadow-[0_1px_black]'>
								Options
							</p>
							<ul className='flex flex-col gap-1 pl-5'>
								{setting.options.map(option => {
									const label = i18nStringTransform(option.label);
									return (
										<li key={label} className='list-disc text-zinc-300'>
											<PeekTag label={label} value={option.value} />
										</li>
									);
								})}
							</ul>
						</div>
					)}
				</div>
			</Tooltip>
		</TooltipProvider>
	);
}

type PeekTagProps = {
	label: string;
	value: unknown;
};

function PeekTag({ label, value }: PeekTagProps) {
	return (
		<div className='grid shrink-0 grid-cols-2 items-center overflow-hidden rounded-1 border-2 border-zinc-400 bg-zinc-700 whitespace-nowrap text-white'>
			<p className='px-2 text-3.5 font-bold'>{label}</p>
			<div
				className={clsx(
					'flex flex-col border-l border-zinc-400 bg-zinc-800 px-2 font-mono whitespace-pre-wrap',
				)}
			>
				{Array.isArray(value) ? (
					value.map((item, index) => {
						return (
							<p
								key={index}
								className='after:content-[","] first:before:content-["["] last:after:content-["]"]'
							>
								{JSON.stringify(item)}
							</p>
						);
					})
				) : (
					<p>{JSON.stringify(value)}</p>
				)}
			</div>
		</div>
	);
}
