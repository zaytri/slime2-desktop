import SettingTypeTag from '@/components/tag/SettingTypeTag';
import { useDialog } from '@/contexts/dialog/useDialog';
import { i18nStringTransform, i18nUndefined } from '@/helpers/i18n';
import SetWidgetSettingDialog from '@@/dialog/SetWidgetSettingDialog';
import {
	AVAILABLE_SETTINGS_GROUPED,
	AVAILABLE_SETTINGS_GROUPED_WITH_SECTION,
	SETTINGS_LABELS,
	type WidgetSetting,
	type WidgetSettings,
} from '@@/json/widgetSettings';
import ArrowDownSvg from '@@/svg/ArrowDownSvg';
import ArrowDownTraySvg from '@@/svg/ArrowDownTraySvg';
import ArrowUpSvg from '@@/svg/ArrowUpSvg';
import ArrowUpTraySvg from '@@/svg/ArrowUpTraySvg';
import DoubleSquareSvg from '@@/svg/DoubleSquareSvg';
import GearSvg from '@@/svg/GearSvg';
import PencilSvg from '@@/svg/PencilSvg';
import PlusSvg from '@@/svg/PlusSvg';
import TrashSvg from '@@/svg/TrashSvg';
import {
	Menu,
	MenuButton,
	MenuButtonArrow,
	MenuGroup,
	MenuGroupLabel,
	MenuItem,
	MenuProvider,
	MenuSeparator,
} from '@ariakit/react';
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
	const categories = Object.entries(value);

	const categoryOptions: { label: string; value: string }[] = [];
	const groupOptions: {
		label: string;
		value: string;
		type:
			| WidgetSetting.Section['type']
			| WidgetSetting.MultiSection['type']
			| 'category';
	}[] = [];
	categories.forEach(([categoryId, category]) => {
		const categoryOption = {
			label: i18nStringTransform(category.label),
			value: categoryId,
		};
		categoryOptions.push(categoryOption);
		groupOptions.push({ ...categoryOption, type: 'category' });

		Object.entries(category.settings).forEach(([settingId, setting]) => {
			if (setting.type === 'section' || setting.type === 'multi-section') {
				groupOptions.push({
					label: i18nStringTransform(setting.label),
					value: settingId,
					type: setting.type,
				});
			}
		});
	});

	function checkIdExists(newId: string) {
		const ids = new Set<string>();

		// collect all existing ids
		categories.forEach(([categoryId, category]) => {
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
					{categories.map(([categoryId, category], categoryIndex) => {
						const categoryLabel = i18nStringTransform(category.label);
						const categorySettings = Object.entries(category.settings);

						return (
							<CategoryEditor
								id={categoryId}
								label={categoryLabel}
								onEdit={() => {
									openDialog(
										'Edit Category',
										<SetWidgetSettingDialog
											id={categoryId}
											label={categoryLabel}
											checkIdExists={checkIdExists}
											onSaveCategory={() => {}}
										/>,
									);
								}}
								onMoveUp={categoryIndex === 0 ? undefined : () => {}}
								onMoveDown={
									categoryIndex === categories.length - 1 ? undefined : () => {}
								}
								onAdd={type => {}}
								addOptions={AVAILABLE_SETTINGS_GROUPED_WITH_SECTION}
								onDemote={(type, categoryId) => {}}
								demoteOptions={categoryOptions}
								onDelete={() => {}}
							>
								{categorySettings.map(([settingId, setting], settingIndex) => {
									if (
										setting.type === 'section' ||
										setting.type === 'multi-section'
									) {
										const sectionSettings = Object.entries(setting.settings);
										return (
											<SectionEditor
												key={settingId}
												id={settingId}
												setting={setting}
												onEdit={() => {
													const label = SETTINGS_LABELS.get(setting.type);
													if (!label) return;

													openDialog(
														`Edit ${label}`,
														<SetWidgetSettingDialog
															id={settingId}
															label={i18nStringTransform(setting.label)}
															condition={setting.condition}
															searchTags={setting.searchTags}
															data={setting}
															checkIdExists={checkIdExists}
															onSaveSetting={() => {}}
														/>,
													);
												}}
												onMoveUp={settingIndex === 0 ? undefined : () => {}}
												onMoveDown={
													settingIndex === categorySettings.length - 1
														? undefined
														: () => {}
												}
												onMoveTo={() => {}}
												moveToOptions={categoryOptions.map(option => {
													// disable option if section is already in this category
													return option.value === categoryId
														? { ...option, disabled: true }
														: option;
												})}
												onAdd={() => {}}
												addOptions={AVAILABLE_SETTINGS_GROUPED}
												onPromote={() => {}}
												onDelete={() => {}}
											>
												{sectionSettings.map(
													(
														[sectionedSettingId, sectionedSetting],
														sectionedSettingIndex,
													) => {
														return (
															<SettingEditor
																key={sectionedSettingId}
																id={sectionedSettingId}
																setting={sectionedSetting}
																onEdit={() => {
																	openDialog(
																		'Edit Setting',
																		<SetWidgetSettingDialog
																			id={sectionedSettingId}
																			label={i18nStringTransform(
																				sectionedSetting.label,
																			)}
																			condition={sectionedSetting.condition}
																			searchTags={sectionedSetting.searchTags}
																			data={sectionedSetting}
																			checkIdExists={checkIdExists}
																			onSaveSetting={() => {}}
																		/>,
																	);
																}}
																onMoveUp={
																	sectionedSettingIndex === 0
																		? undefined
																		: () => {}
																}
																onMoveDown={
																	sectionedSettingIndex ===
																	sectionSettings.length - 1
																		? undefined
																		: () => {}
																}
																onMoveTo={() => {}}
																moveToOptions={groupOptions.map(option => {
																	// disable option if setting is already in this section
																	return option.value === settingId
																		? { ...option, disabled: true }
																		: option;
																})}
																onDuplicate={() => {}}
																onDelete={() => {}}
															/>
														);
													},
												)}
											</SectionEditor>
										);
									} else {
										return (
											<SettingEditor
												key={settingId}
												id={settingId}
												setting={setting}
												onEdit={() => {
													openDialog(
														'Edit Setting',
														<SetWidgetSettingDialog
															id={settingId}
															label={i18nStringTransform(setting.label)}
															condition={setting.condition}
															searchTags={setting.searchTags}
															data={setting}
															checkIdExists={checkIdExists}
															onSaveSetting={() => {}}
														/>,
													);
												}}
												onMoveUp={settingIndex === 0 ? undefined : () => {}}
												onMoveDown={
													settingIndex === categorySettings.length - 1
														? undefined
														: () => {}
												}
												onMoveTo={() => {}}
												moveToOptions={groupOptions.map(option => {
													// disable option if setting is already directly in this category
													return option.value === categoryId
														? { ...option, disabled: true }
														: option;
												})}
												onDuplicate={() => {}}
												onDelete={() => {}}
											/>
										);
									}
								})}
							</CategoryEditor>
						);
					})}
				</div>
			</div>
		</section>
	);
}

type CategoryEditorProps = {
	id: string;
	label: string;
	onEdit: VoidFunction;
	onMoveUp?: VoidFunction;
	onMoveDown?: VoidFunction;
	onAdd: (value: WidgetSetting.NonCategory['type']) => void;
	addOptions: {
		label: string;
		options: { label: string; value: WidgetSetting.NonCategory['type'] }[];
	}[];
	onDemote: (
		type: WidgetSetting.Section['type'] | WidgetSetting.MultiSection['type'],
		categoryId: string,
	) => void;
	demoteOptions: {
		label: string;
		value: string;
	}[];
	onDelete: VoidFunction;
};

function CategoryEditor({
	id,
	label,
	onEdit,
	onMoveUp,
	onMoveDown,
	onAdd,
	addOptions,
	onDemote,
	demoteOptions,
	onDelete,
	children,
}: Props.WithChildren<CategoryEditorProps>) {
	return (
		<div className='flex flex-col gap-2'>
			<SettingHeader id={id} type='category' label={i18nStringTransform(label)}>
				<SettingMenu
					onEdit={onEdit}
					onMoveUp={onMoveUp}
					onMoveDown={onMoveDown}
					onAdd={onAdd}
					addOptions={addOptions}
					onDemote={onDemote}
					demoteOptions={demoteOptions}
					onDelete={onDelete}
				/>
			</SettingHeader>

			<div className='flex gap-2'>
				<div className='w-4 rounded-bl-full bg-yellow-800'></div>
				<div className='flex flex-1 flex-col gap-2'>{children}</div>
			</div>
		</div>
	);
}

type SectionEditorProps = {
	id: string;
	setting: Pick<
		WidgetSetting.Section | WidgetSetting.MultiSection,
		'label' | 'condition' | 'searchTags' | 'type'
	>;
	onEdit: VoidFunction;
	onMoveUp?: VoidFunction;
	onMoveDown?: VoidFunction;
	onMoveTo: (value: string) => void;
	moveToOptions: {
		label: string;
		value: string;
		disabled?: boolean;
	}[];
	onAdd: (value: WidgetSetting.NonGroup['type']) => void;
	addOptions: {
		label: string;
		options: { label: string; value: WidgetSetting.NonGroup['type'] }[];
	}[];
	onPromote: VoidFunction;
	onDelete: VoidFunction;
};

function SectionEditor({
	id,
	setting,
	onEdit,
	onMoveUp,
	onMoveDown,
	onMoveTo,
	moveToOptions,
	onAdd,
	addOptions,
	onPromote,
	onDelete,
	children,
}: Props.WithChildren<SectionEditorProps>) {
	return (
		<div className='flex flex-col gap-2'>
			<SettingHeader
				id={id}
				type={setting.type}
				label={i18nStringTransform(setting.label)}
			>
				<SettingMenu
					onEdit={onEdit}
					onMoveUp={onMoveUp}
					onMoveDown={onMoveDown}
					onMoveTo={onMoveTo}
					moveToOptions={moveToOptions}
					onAdd={onAdd}
					addOptions={addOptions}
					onPromote={onPromote}
					onDelete={onDelete}
				/>
			</SettingHeader>

			<div className='flex gap-2'>
				<div
					className={clsx(
						'w-4 rounded-bl-full',
						setting.type === 'section' && 'bg-cyan-800',
						setting.type === 'multi-section' && 'bg-blue-900',
					)}
				></div>
				<div className='flex flex-1 flex-col gap-2'>{children}</div>
			</div>
		</div>
	);
}

type SettingEditorProps = {
	id: string;
	setting: WidgetSetting.NonGroup;
	onEdit: VoidFunction;
	onMoveUp?: VoidFunction;
	onMoveDown?: VoidFunction;
	onMoveTo: (value: string) => void;
	moveToOptions: {
		label: string;
		value: string;
		type:
			| WidgetSetting.Section['type']
			| WidgetSetting.MultiSection['type']
			| 'category';
		disabled?: boolean;
	}[];
	onDuplicate: VoidFunction;
	onDelete: VoidFunction;
};

function SettingEditor({
	id,
	setting,
	onEdit,
	onMoveUp,
	onMoveDown,
	onMoveTo,
	moveToOptions,
	onDuplicate,
	onDelete,
}: SettingEditorProps) {
	return (
		<div className='flex flex-1 flex-col'>
			<SettingHeader
				id={id}
				type={setting.type}
				label={i18nStringTransform(setting.label)}
			>
				<SettingMenu
					onEdit={onEdit}
					onMoveUp={onMoveUp}
					onMoveDown={onMoveDown}
					onMoveTo={onMoveTo}
					moveToOptions={moveToOptions}
					onDuplicate={onDuplicate}
					onDelete={onDelete}
				/>
			</SettingHeader>

			<div className='flex gap-2'>
				<div className='h-[calc(100%-8px)] w-4 self-end rounded-bl-full bg-green-800'></div>

				<div className='flex flex-1 flex-col'>
					<div className='flex flex-wrap gap-2 pt-2 empty:hidden'>
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
								{JSON.stringify(i18nUndefined(setting.placeholder))}
							</SettingProperty>
						)}
					</div>

					<div className='flex flex-col pt-2 empty:hidden'>
						{'description' in setting && (
							<SettingProperty label='Description'>
								{JSON.stringify(i18nUndefined(setting.description))}
							</SettingProperty>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

type SettingHeaderProps = {
	type: WidgetSetting.NonCategory['type'] | 'category';
	label: string;
	id: string;
};

function SettingHeader({
	label,
	id,
	type,
	children,
}: Props.WithChildren<SettingHeaderProps>) {
	const labelClassName = clsx(
		type === 'category'
			? 'bg-yellow-800!'
			: type === 'section'
				? 'bg-cyan-800!'
				: type === 'multi-section'
					? 'bg-blue-900!'
					: 'bg-green-800!',
	);

	const className = clsx(
		type === 'category'
			? 'bg-yellow-50!'
			: type === 'section'
				? 'bg-cyan-50!'
				: type === 'multi-section'
					? 'bg-sky-50!'
					: 'bg-green-50!',
	);

	return (
		<div className='flex items-start gap-1'>
			<SettingProperty
				label='Label'
				className={clsx('flex-1', className)}
				labelClassName={clsx('px-2 py-1! text-3.5!', labelClassName)}
				valueClassName={clsx(
					type === 'text-display'
						? 'font-nunito!'
						: 'mb-px! px-1 font-fredoka! text-4!',
				)}
			>
				{label}
			</SettingProperty>

			<SettingProperty
				label='ID'
				className={className}
				labelClassName={clsx('px-2 py-1! text-3.5!', labelClassName)}
				valueClassName={clsx('mb-0! px-0.5 text-3.25! font-bold!')}
				quickSelect
			>
				{id}
			</SettingProperty>

			<SettingTypeTag type={type} />

			{/* menu */}
			{children}
		</div>
	);
}

type SettingPropertyProps = {
	label: string;
	labelClassName?: string;
	valueClassName?: string;
	quickSelect?: boolean;
};

function SettingProperty({
	label,
	children,
	className,
	labelClassName,
	valueClassName,
	quickSelect = false,
}: Props.WithClassNameAndChildren<SettingPropertyProps>) {
	return (
		<div
			className={clsx(
				'flex items-stretch gap-1 overflow-hidden rounded-1 border border-zinc-800 bg-zinc-50 pr-1',
				className,
			)}
		>
			<p
				className={clsx(
					'flex bg-zinc-700 px-1 pt-0.5 text-3.25 font-semibold text-white',
					labelClassName,
				)}
			>
				{label}
			</p>
			<div
				className={clsx(
					'-mb-px flex items-center px-0.5 font-mono text-3.5 font-medium text-zinc-800',
					valueClassName,
				)}
				onClick={event => {
					if (quickSelect) {
						getSelection()?.selectAllChildren(event.currentTarget);
					}
				}}
			>
				{children}
			</div>
		</div>
	);
}

type BaseSettingMenuProps = {
	onEdit: VoidFunction;
	onMoveUp?: VoidFunction;
	onMoveDown?: VoidFunction;
	onMoveTo?: never;
	moveToOptions?: never;
	onAdd?: never;
	addOptions?: never;
	onPromote?: never;
	onDemote?: never;
	demoteOptions?: never;
	onDuplicate?: never;
	onDelete: VoidFunction;
};

type SettingMenuProps<AddOptionValue> =
	| Override<
			BaseSettingMenuProps,
			{
				// category props
				onAdd: (value: AddOptionValue) => void;
				addOptions: {
					label: string;
					options: { label: string; value: AddOptionValue }[];
				}[];
				onDemote: CategoryEditorProps['onDemote'];
				demoteOptions: CategoryEditorProps['demoteOptions'];
			}
	  >
	| Override<
			BaseSettingMenuProps,
			{
				// section props
				onMoveTo: SectionEditorProps['onMoveTo'];
				moveToOptions: SectionEditorProps['moveToOptions'];
				onAdd: (value: AddOptionValue) => void;
				addOptions: {
					label: string;
					options: { label: string; value: AddOptionValue }[];
				}[];
				onPromote: VoidFunction;
			}
	  >
	| Override<
			BaseSettingMenuProps,
			{
				// non group setting props
				onMoveTo: SettingEditorProps['onMoveTo'];
				moveToOptions: SettingEditorProps['moveToOptions'];
				onDuplicate: VoidFunction;
			}
	  >;

function SettingMenu<AddType>({
	onEdit,
	onMoveUp,
	onMoveDown,
	onMoveTo,
	moveToOptions,
	onAdd,
	addOptions,
	onPromote,
	onDemote,
	demoteOptions,
	onDuplicate,
	onDelete,
}: SettingMenuProps<AddType>) {
	const menuItemClassName = clsx(
		'flex cursor-pointer items-center gap-2 rounded-1 px-2 py-1 text-white outline-offset-0! drop-shadow-[0_1px_black] outline-none select-none aria-disabled:text-zinc-400 data-active-item:bg-white data-active-item:text-zinc-800',
	);
	const menuClassName = clsx(
		'z-40 flex min-w-36 flex-col dark-container rounded-2 p-1.5 font-semibold shadow-[0_5px_10px_#0008] backdrop-blur-sm',
	);

	const menuGroupClassName = clsx(
		'text-3 font-bold text-zinc-400 uppercase select-none text-shadow-[0_1px_black]',
	);

	const demoteSections: (
		| WidgetSetting.Section['type']
		| WidgetSetting.MultiSection['type']
	)[] = ['section', 'multi-section'];

	return (
		<MenuProvider>
			<MenuButton className='flex rounded-1 border border-transparent p-1 text-zinc-700 over:border-zinc-900 over:bg-zinc-800 over:text-white'>
				<GearSvg className='size-5' />
			</MenuButton>
			<Menu modal className={menuClassName}>
				{/* Edit */}
				<MenuItem className={menuItemClassName} onClick={onEdit}>
					<PencilSvg className='size-4' />
					<p>Edit</p>
				</MenuItem>

				{/* Move Up */}
				<MenuItem
					disabled={!onMoveUp}
					className={menuItemClassName}
					onClick={onMoveUp}
				>
					<ArrowUpSvg className='size-4' />
					<p>Move Up</p>
				</MenuItem>

				{/* Move Down */}
				<MenuItem
					disabled={!onMoveDown}
					className={menuItemClassName}
					onClick={onMoveDown}
				>
					<ArrowDownSvg className='size-4' />
					<p>Move Down</p>
				</MenuItem>

				{/* Move To */}
				{onMoveTo && moveToOptions && (
					<MenuProvider placement='left-start'>
						<MenuItem
							disabled={moveToOptions.length === 0}
							render={<MenuButton />}
							className={menuItemClassName}
						>
							<MenuButtonArrow />
							<p>Move To</p>
						</MenuItem>

						<Menu
							modal
							fitViewport
							className={clsx(
								menuClassName,
								'max-h-(--popover-available-height) overflow-hidden p-0!',
							)}
						>
							<MenuGroup className='flex flex-col overflow-y-auto p-1.5'>
								{moveToOptions.map(option => {
									const isSection =
										'type' in option && option.type !== 'category';

									return (
										<MenuItem
											key={option.label}
											disabled={option.disabled}
											className={clsx(
												menuItemClassName,
												'py-0.5!',
												isSection && 'pl-3',
											)}
											onClick={() => {
												onMoveTo(option.value);
											}}
										>
											{isSection && (
												<div className='size-1.5 rounded-full bg-current'></div>
											)}
											{option.label}
										</MenuItem>
									);
								})}
							</MenuGroup>
						</Menu>
					</MenuProvider>
				)}

				{/* Add New */}
				{onAdd && addOptions && (
					<MenuProvider placement='left-start'>
						<MenuItem render={<MenuButton />} className={menuItemClassName}>
							<MenuButtonArrow />
							<p>Add New</p>
						</MenuItem>
						<Menu
							modal
							fitViewport
							className={clsx(
								menuClassName,
								'max-h-(--popover-available-height) overflow-hidden p-0!',
							)}
						>
							<div className='flex flex-col gap-1 divide-y divide-zinc-600 overflow-y-auto px-2 py-1.5'>
								{addOptions.map(group => {
									return (
										<MenuGroup key={group.label} className='flex flex-col'>
											<MenuGroupLabel className={menuGroupClassName}>
												{group.label}
											</MenuGroupLabel>
											{group.options.map(option => {
												return (
													<MenuItem
														key={option.label}
														className={clsx(menuItemClassName, 'px-4! py-0.5!')}
														onClick={() => {
															onAdd(option.value);
														}}
													>
														{option.label}
													</MenuItem>
												);
											})}
										</MenuGroup>
									);
								})}
							</div>
						</Menu>
					</MenuProvider>
				)}

				{/* Promote to Category */}
				{onPromote && (
					<MenuItem className={menuItemClassName} onClick={onPromote}>
						<ArrowUpTraySvg className='size-4' />
						<p>Promote to Category</p>
					</MenuItem>
				)}

				{/* Demote to Section */}
				{onDemote && demoteOptions && (
					<MenuProvider placement='left-start'>
						<MenuItem
							disabled={demoteOptions.length === 0}
							render={<MenuButton />}
							className={menuItemClassName}
						>
							<MenuButtonArrow />
							<p>Demote to</p>
						</MenuItem>
						<Menu modal className={menuClassName}>
							{demoteSections.map(type => {
								const label = SETTINGS_LABELS.get(type);
								if (!label) return null;

								return (
									<MenuProvider placement='left-start'>
										<MenuItem
											key={type}
											render={<MenuButton />}
											className={clsx(menuItemClassName)}
										>
											<MenuButtonArrow />
											<p>{label}</p>
										</MenuItem>

										<Menu
											modal
											fitViewport
											className={clsx(
												menuClassName,
												'max-h-(--popover-available-height) overflow-hidden p-0!',
											)}
										>
											<MenuGroup className='flex flex-col overflow-y-auto p-1.5'>
												<MenuGroupLabel className='p-1 text-3.5 text-zinc-300'>
													<div className='flex items-center gap-1'>
														<ArrowDownTraySvg className='mr-1 size-3.5' />
														Demote to{' '}
														<strong className='font-bold underline underline-offset-3'>
															{label}
														</strong>{' '}
														in:
													</div>
												</MenuGroupLabel>

												<MenuSeparator className='border-zinc-500 pb-1' />

												{demoteOptions.map(option => {
													return (
														<MenuItem
															key={option.label}
															className={clsx(menuItemClassName, 'py-0.5!')}
															onClick={() => {
																onDemote(type, option.value);
															}}
														>
															{option.label}
														</MenuItem>
													);
												})}
											</MenuGroup>
										</Menu>
									</MenuProvider>
								);
							})}
						</Menu>
					</MenuProvider>
				)}

				{/* Duplicate */}
				{onDuplicate && (
					<MenuItem className={menuItemClassName} onClick={onDuplicate}>
						<DoubleSquareSvg className='size-4' />
						<p>Duplicate</p>
					</MenuItem>
				)}

				{/* Delete */}
				<MenuItem
					className={clsx(
						menuItemClassName,
						'text-rose-300! data-active-item:bg-rose-300! data-active-item:text-rose-950!',
					)}
					onClick={onDelete}
				>
					<TrashSvg className='size-4' />
					<p>Delete</p>
				</MenuItem>
			</Menu>
		</MenuProvider>
	);
}
