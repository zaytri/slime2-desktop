import SettingTypeTag from '@/components/tag/SettingTypeTag';
import { useDialog } from '@/contexts/dialog/useDialog';
import { i18nStringTransform } from '@/helpers/i18n';
import SetWidgetSettingDialog from '@@/dialog/SetWidgetSettingDialog';
import {
	AVAILABLE_SETTINGS_GROUPED,
	AVAILABLE_SETTINGS_GROUPED_WITH_SECTION,
	SETTINGS_LABELS,
	type WidgetSetting,
	type WidgetSettings,
} from '@@/json/widgetSettings';
import ArrowDownSvg from '@@/svg/ArrowDownSvg';
import ArrowUpSvg from '@@/svg/ArrowUpSvg';
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
				<div className='flex flex-1 flex-col gap-2 overflow-y-auto p-3 pr-1'>
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
												onConvert={() => {}}
												convertOptions={(
													['section', 'multi-section'] as (
														| WidgetSetting.Section['type']
														| WidgetSetting.MultiSection['type']
													)[]
												).map(type => {
													return {
														label: SETTINGS_LABELS.get(type)!,
														value: type,
														disabled: setting.type === type,
													};
												})}
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
		<div className='flex flex-col'>
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
					className='text-yellow-800 over:border-yellow-900! over:bg-yellow-800!'
				/>
			</SettingHeader>

			<div className='-mt-1 flex flex-col gap-2 rounded-bl-2 border-l-8 border-yellow-900 pt-3 pb-2 pl-2'>
				{children}
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
	onConvert: (
		value: WidgetSetting.Section['type'] | WidgetSetting.MultiSection['type'],
	) => void;
	convertOptions: {
		label: string;
		value: WidgetSetting.Section['type'] | WidgetSetting.MultiSection['type'];
		disabled?: boolean;
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
	onConvert,
	convertOptions,
	onPromote,
	onDelete,
	children,
}: Props.WithChildren<SectionEditorProps>) {
	return (
		<div className='flex flex-col'>
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
					onConvert={onConvert}
					convertOptions={convertOptions}
					onPromote={onPromote}
					onDelete={onDelete}
					className={clsx(
						setting.type === 'section' &&
							'text-cyan-800 over:border-cyan-900! over:bg-cyan-800!',
						setting.type === 'multi-section' &&
							'text-blue-900 over:border-blue-950! over:bg-blue-900!',
					)}
				/>
			</SettingHeader>

			<div
				className={clsx(
					'-mt-1 flex flex-col gap-2 rounded-bl-2 border-l-8 pt-3 pb-2 pl-2',
					setting.type === 'section' && 'border-cyan-900',
					setting.type === 'multi-section' && 'border-blue-950',
				)}
			>
				{children}
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
	const values: {
		label: string;
		value: unknown;
		full?: boolean;
	}[] = [];

	if ('defaultValue' in setting) {
		values.push({ label: 'Default Value', value: setting.defaultValue });
	}

	if ('min' in setting) {
		values.push({ label: 'Min', value: setting.min });
	}

	if ('max' in setting) {
		values.push({ label: 'Max', value: setting.max });
	}

	if ('step' in setting) {
		values.push({ label: 'Step', value: setting.step });
	}

	if ('placeholder' in setting) {
		values.push({ label: 'Placeholder', value: setting.placeholder });
	}

	if ('description' in setting) {
		values.push({
			label: 'Description',
			value: setting.description,
			full: true,
		});
	}

	return (
		<div className='flex flex-1 flex-col'>
			<SettingHeader
				id={id}
				type={setting.type}
				label={i18nStringTransform(setting.label)}
				hasValues={values.length > 0}
			>
				<SettingMenu
					onEdit={onEdit}
					onMoveUp={onMoveUp}
					onMoveDown={onMoveDown}
					onMoveTo={onMoveTo}
					moveToOptions={moveToOptions}
					onDuplicate={onDuplicate}
					onDelete={onDelete}
					className='text-green-800 over:border-green-900! over:bg-green-800!'
				/>
			</SettingHeader>

			<div className='mr-9.25 flex'>
				<div className='m-px -mt-0.5 flex flex-1 flex-wrap gap-2 rounded-b-2 border-2 border-x-8 border-green-900 bg-green-100 px-2 py-2 outline outline-green-900 empty:hidden'>
					{values.map(({ label, value, full }) => {
						return (
							<SettingProperty
								key={label}
								label={label}
								className={clsx(full && 'w-full')}
							>
								{JSON.stringify(value)}
							</SettingProperty>
						);
					})}
				</div>
			</div>
		</div>
	);
}

type SettingHeaderProps = {
	type: WidgetSetting.NonCategory['type'] | 'category';
	label: string;
	id: string;
	hasValues?: boolean;
};

function SettingHeader({
	label,
	id,
	type,
	children,
	hasValues,
}: Props.WithChildren<SettingHeaderProps>) {
	const valueClassName = clsx({
		'bg-yellow-50! text-yellow-900!': type === 'category',
		'bg-cyan-50! text-cyan-900!': type === 'section',
		'bg-sky-50! text-blue-900!': type === 'multi-section',
		'text-green-900!':
			type !== 'category' && type !== 'section' && type !== 'multi-section',
	});

	const className = clsx('border-2!', {
		'border-yellow-900! bg-yellow-800!': type === 'category',
		'border-cyan-900! bg-cyan-800!': type === 'section',
		'border-blue-950! bg-blue-900!': type === 'multi-section',
	});

	return (
		<div className='z-1 flex items-start gap-1'>
			<SettingProperty
				label='Label'
				className={clsx('flex-1', hasValues && 'rounded-b-0', className)}
				labelClassName={clsx('py-1! text-3.5!')}
				valueClassName={clsx(
					type === 'text-display'
						? 'font-nunito!'
						: '-mt-0.5 font-fredoka! text-4!',
					valueClassName,
				)}
			>
				{label}
			</SettingProperty>

			<SettingProperty
				label='ID'
				className={clsx(hasValues && 'rounded-b-0', className)}
				labelClassName={clsx('py-1! text-3.5!')}
				valueClassName={clsx('text-3.25! font-bold!', valueClassName)}
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
				'flex items-stretch overflow-hidden rounded-1 border border-green-900 bg-green-800',
				className,
			)}
		>
			<p
				className={clsx(
					'flex px-1.5 pt-0.5 text-3.25 font-semibold text-white',
					labelClassName,
				)}
			>
				{label}
			</p>
			<div
				className={clsx(
					'flex flex-1 items-center bg-green-50 px-1.5 font-mono text-3.5 font-medium text-zinc-800',
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
	onConvert?: never;
	convertOptions?: never;
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
				onConvert: SectionEditorProps['onConvert'];
				convertOptions: SectionEditorProps['convertOptions'];
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
	onConvert,
	convertOptions,
	onPromote,
	onDemote,
	demoteOptions,
	onDuplicate,
	onDelete,
	className,
}: Props.WithClassName<SettingMenuProps<AddType>>) {
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
			<MenuButton
				className={clsx(
					'flex rounded-1 border-2 border-transparent p-1 over:border-zinc-900 over:bg-zinc-800 over:text-white',
					className,
				)}
			>
				<GearSvg className='size-5.25' />
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

				{/* Promote to Category or Convert to Other Section */}
				{onConvert && convertOptions && onPromote && (
					<MenuProvider placement='left-start'>
						<MenuItem render={<MenuButton />} className={menuItemClassName}>
							<MenuButtonArrow />
							<p>Convert To</p>
						</MenuItem>

						<Menu modal className={menuClassName}>
							<MenuItem onClick={onPromote} className={menuItemClassName}>
								Category
							</MenuItem>
							{convertOptions.map(option => {
								return (
									<MenuItem
										key={option.label}
										disabled={option.disabled}
										onClick={() => {
											onConvert(option.value);
										}}
										className={menuItemClassName}
									>
										{option.label}
									</MenuItem>
								);
							})}
						</Menu>
					</MenuProvider>
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
							<p>Convert to</p>
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
													Convert to{' '}
													<strong className='font-bold'>{label}</strong> + Move
													to:
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
