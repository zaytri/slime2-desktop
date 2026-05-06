import { useDialog } from '@/contexts/dialog/useDialog';
import { i18nStringTransform } from '@/helpers/i18n';
import { capitalizeWord } from '@/helpers/string';
import SetWidgetSettingDialog from '@@/dialog/SetWidgetSettingDialog';
import type { WidgetSetting, WidgetSettings } from '@@/json/widgetSettings';
import BookSvg from '@@/svg/BookSvg';
import GearSvg from '@@/svg/GearSvg';
import GridSvg from '@@/svg/GridSvg';
import PlusSvg from '@@/svg/PlusSvg';
import clsx from 'clsx';

type WidgetSettingsEditorProps = {
	value: WidgetSettings;
	onChange: (settings: WidgetSettings) => void;
};

export default function WidgetSettingsEditor({
	value,
	onChange,
}: WidgetSettingsEditorProps) {
	const { openDialog } = useDialog();

	function checkIdExists(newId: string) {
		const ids = new Set<string>();

		// collect all existing ids
		Object.entries(value).forEach(([categoryId, category]) => {
			ids.add(categoryId);
			Object.entries(category.settings).forEach(([settingId, setting]) => {
				ids.add(settingId);
				if (setting.type === 'section' || setting.type === 'multi-section') {
					Object.keys(setting.settings).forEach(sectionedSettingId => {
						ids.add(sectionedSettingId);
					});
				}
			});
		});

		return ids.has(newId);
	}

	return (
		<section className='flex flex-2 flex-col gap-2'>
			<div className='flex items-end gap-2'>
				<h2 className='flex-1 px-3 font-mochiy text-4.5 text-white text-shadow-[0_1px_black]'>
					Widget Settings
				</h2>

				<button
					type='button'
					className='flex items-center gap-2 font-fredoka font-medium text-white over:underline'
				>
					<PlusSvg className='size-3' />
					<p>Add Category</p>
				</button>
			</div>

			<div className='flex flex-1 flex-col overflow-hidden light-container'>
				<div className='flex flex-1 flex-col gap-2 overflow-y-auto p-3'>
					{Object.entries(value).map(([categoryId, category]) => {
						const categorySettings = Object.entries(category.settings);

						return (
							<div
								key={categoryId}
								className='flex flex-col gap-2 rounded-2 border-2 border-zinc-300 bg-white p-2 outline outline-white'
							>
								<div className='flex items-end gap-2'>
									<DisplayIdType type='category' id={categoryId} />
									<p className='flex-1 font-mochiy text-4.5 text-zinc-800'>
										{i18nStringTransform(category.label)}
									</p>
									<div className='flex flex-col items-end'>
										<EditSettingButton
											onClick={() => {
												openDialog(
													'Edit Category',
													<SetWidgetSettingDialog
														id={categoryId}
														label={i18nStringTransform(category.label)}
														checkIdExists={checkIdExists}
														onSaveCategory={() => {}}
													/>,
												);
											}}
										/>
										<p className='font-fredoka font-medium'>
											{categorySettings.length} Items
										</p>
									</div>
								</div>

								{categorySettings.length > 0 && (
									<div className='flex flex-col gap-2'>
										{categorySettings.map(([settingId, setting]) => {
											if (
												setting.type === 'section' ||
												setting.type === 'multi-section'
											) {
												const sectionSettings = Object.entries(
													setting.settings,
												);

												return (
													<div
														key={settingId}
														className='flex flex-col gap-2 rounded-2 border-2 border-zinc-300 bg-white p-2'
													>
														<div className='flex items-end gap-2'>
															<DisplayIdType
																type={setting.type}
																id={settingId}
															/>
															<p className='flex-1 font-mochiy text-4'>
																{i18nStringTransform(setting.label)}
															</p>

															<div className='flex flex-col items-end'>
																<EditSettingButton
																	onClick={() => {
																		openDialog(
																			`Edit ${capitalizeWord(setting.type)}`,
																			<SetWidgetSettingDialog
																				id={settingId}
																				label={i18nStringTransform(
																					setting.label,
																				)}
																				condition={setting.condition}
																				searchTags={setting.searchTags}
																				data={{ type: setting.type }}
																				checkIdExists={checkIdExists}
																				onSaveSetting={() => {}}
																			/>,
																		);
																	}}
																/>
																<p className='font-fredoka font-medium'>
																	{sectionSettings.length} Items
																</p>
															</div>
														</div>

														{sectionSettings.length > 0 && (
															<div className='flex flex-col gap-2'>
																{sectionSettings.map(([settingId, setting]) => {
																	return (
																		<DisplaySetting
																			key={settingId}
																			id={settingId}
																			setting={setting}
																			onEdit={() => {
																				const {
																					label,
																					condition,
																					searchTags,
																					...data
																				} = setting;

																				openDialog(
																					'Edit Setting',
																					<SetWidgetSettingDialog
																						id={settingId}
																						label={i18nStringTransform(label)}
																						condition={condition}
																						searchTags={searchTags}
																						checkIdExists={checkIdExists}
																						data={data}
																					/>,
																				);
																			}}
																		/>
																	);
																})}
															</div>
														)}
													</div>
												);
											}
											return (
												<DisplaySetting
													key={settingId}
													id={settingId}
													setting={setting}
													onEdit={() => {
														const { label, condition, searchTags, ...data } =
															setting;

														openDialog(
															'Edit Setting',
															<SetWidgetSettingDialog
																id={settingId}
																label={i18nStringTransform(label)}
																condition={condition}
																searchTags={searchTags}
																checkIdExists={checkIdExists}
																data={data}
															/>,
														);
													}}
												/>
											);
										})}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

type SettingPropertyProps = {
	label: string;
};

function SettingProperty({
	label,
	children,
}: Props.WithChildren<SettingPropertyProps>) {
	return (
		<div className='flex items-stretch gap-1 overflow-hidden rounded-1 border border-zinc-800 bg-zinc-200 pr-1'>
			<p className='flex bg-zinc-700 px-1 pt-0.5 text-3.25 font-bold text-white'>
				{label}
			</p>
			<div className='-mb-px flex items-center text-3.5 font-medium text-zinc-800'>
				{children}
			</div>
		</div>
	);
}

type DisplayIdTypeProps = {
	id: string;
	type: WidgetSetting.NonCategory['type'] | 'category';
};

function DisplayIdType({ id, type }: DisplayIdTypeProps) {
	return (
		<div className='flex flex-col overflow-hidden rounded-1 border border-zinc-800 font-bold'>
			<div
				className={clsx(
					'flex items-center gap-1 bg-zinc-700 px-1.5 text-3.5 text-white',
					type === 'category' && 'bg-green-800!',
					type === 'section' && 'bg-sky-800!',
					type === 'multi-section' && 'bg-indigo-800!',
				)}
			>
				{(type === 'category' ||
					type === 'section' ||
					type === 'multi-section') && <GridSvg className='size-3' />}
				<p>{type === 'category' ? 'Category' : settingTypeMap[type]}</p>
			</div>
			<div className='flex items-center gap-1.5 bg-zinc-200 px-1.5 text-3.25 text-zinc-800'>
				<BookSvg className='h-3' />
				<p className='-mb-px'>{id}</p>
			</div>
		</div>
	);
}

type DisplaySettingProps = {
	id: string;
	setting: WidgetSetting.NonGroup;
	onEdit: VoidFunction;
};

function DisplaySetting({ id, setting, onEdit }: DisplaySettingProps) {
	return (
		<div className='flex flex-col gap-2 rounded-2 border-2 border-zinc-300 bg-white p-2'>
			<div className='flex items-center gap-2'>
				<div className='flex self-start'>
					<DisplayIdType type={setting.type} id={id} />
				</div>
				<p className='flex-1 font-semibold'>
					{i18nStringTransform(setting.label)}
				</p>
				<div className='self-start'>
					<EditSettingButton
						onClick={() => {
							onEdit();
						}}
					/>
				</div>
			</div>

			<div className='flex flex-wrap gap-2 empty:hidden'>
				{'defaultValue' in setting && (
					<SettingProperty label='Default Value'>
						{JSON.stringify(setting.defaultValue)}
					</SettingProperty>
				)}
				{'min' in setting && (
					<SettingProperty label='Min'>
						{JSON.stringify(setting.min)}
					</SettingProperty>
				)}
				{'max' in setting && (
					<SettingProperty label='Max'>
						{JSON.stringify(setting.max)}
					</SettingProperty>
				)}
				{'step' in setting && (
					<SettingProperty label='Step'>
						{JSON.stringify(setting.step)}
					</SettingProperty>
				)}
				{'placeholder' in setting && (
					<SettingProperty label='Placeholder'>
						{JSON.stringify(setting.placeholder)}
					</SettingProperty>
				)}
			</div>

			{'description' in setting && (
				<SettingProperty label='Description'>
					{JSON.stringify(setting.description)}
				</SettingProperty>
			)}
		</div>
	);
}

const settingTypeMap: Record<WidgetSetting.NonCategory['type'], string> = {
	section: 'Section',
	'multi-section': 'Multi-Section',

	button: 'Button',

	'text-display': 'Text Display',
	'image-display': 'Image Display',

	'text-input': 'Text Input',
	'text-area-input': 'Text Area Input',
	'multi-text-input': 'Multi-Text Input',

	'number-input': 'Number Input',
	'slider-input': 'Slider Input',

	'toggle-input': 'Toggle Input',

	'dropdown-input': 'Dropdown Input',
	'select-input': 'Select Input',
	'multi-select-input': 'Multi-Select Input',

	'font-input': 'Font Input',
	'color-input': 'Color Input',

	'image-input': 'Image Input',
	'multi-image-input': 'Multi-Image Input',

	'video-input': 'Video Input',
	'multi-video-input': 'Multi-Video Input',

	'audio-input': 'Audio Input',
	'multi-audio-input': 'Multi-Audio Input',
};

type EditSettingButtonProps = {
	onClick: VoidFunction;
};

function EditSettingButton({ onClick }: EditSettingButtonProps) {
	return (
		<button type='button' onClick={onClick} className=''>
			<GearSvg className='size-4 text-zinc-800' />
		</button>
	);
}
