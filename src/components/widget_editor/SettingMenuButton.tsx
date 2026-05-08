import { SETTINGS_LABELS, type WidgetSetting } from '@@/json/widgetSettings';
import ArrowDownSvg from '@@/svg/ArrowDownSvg';
import ArrowLeftRightSvg from '@@/svg/ArrowLeftRightSvg';
import ArrowUpSvg from '@@/svg/ArrowUpSvg';
import ArrowUpTraySvg from '@@/svg/ArrowUpTraySvg';
import DoubleSquareSvg from '@@/svg/DoubleSquareSvg';
import GearSvg from '@@/svg/GearSvg';
import PencilSvg from '@@/svg/PencilSvg';
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

const DEMOTE_SECTIONS: (
	| WidgetSetting.Section['type']
	| WidgetSetting.MultiSection['type']
)[] = ['section', 'multi-section'];

type BaseSettingMenuProps = {
	onEdit: VoidFunction;

	onMoveUp?: VoidFunction;
	onMoveDown?: VoidFunction;

	onAdd?: never;
	addOptions?: never;

	onMoveTo?: never;
	moveToOptions?: never;

	onConvert?: never;
	convertOptions?: never;
	onPromote?: never;

	onDemote?: never;
	demoteOptions?: never;

	onDuplicate?: never;
	onDelete: VoidFunction;
};

type CategoryMenuProps<AddOption> = Override<
	BaseSettingMenuProps,
	AddMenuProps<AddOption> & DemoteMenuProps
>;

type SectionMenuProps<AddOption> = Override<
	BaseSettingMenuProps,
	AddMenuProps<AddOption> & MoveMenuProps & ConvertSectionMenuProps
>;

type SettingMenuProps = Override<
	BaseSettingMenuProps,
	MoveMenuProps & {
		onDuplicate: VoidFunction;
	}
>;

type SettingMenuButtonProps<AddOptionValue> =
	| CategoryMenuProps<AddOptionValue>
	| SectionMenuProps<AddOptionValue>
	| SettingMenuProps;

export default function SettingMenuButton<AddType>({
	onEdit,

	onMoveUp,
	onMoveDown,

	onAdd,
	addOptions,

	onMoveTo,
	moveToOptions,

	onConvert,
	convertOptions,
	onPromote,

	onDemote,
	demoteOptions,

	onDuplicate,
	onDelete,

	className,
}: Props.WithClassName<SettingMenuButtonProps<AddType>>) {
	return (
		<MenuProvider>
			<MenuButton
				className={clsx(
					'flex rounded-1 border-2 border-transparent p-1 aria-expanded:border-zinc-900 aria-expanded:bg-zinc-800 aria-expanded:text-white over:border-zinc-900 over:bg-zinc-800 over:text-white',
					className,
				)}
			>
				<GearSvg className='size-5.25' />
			</MenuButton>

			<Menu unmountOnHide modal className='dark-menu'>
				{/* Edit */}
				<MenuItem className='dark-menu-item' onClick={onEdit}>
					<PencilSvg className='size-4' />
					<p>Edit</p>
				</MenuItem>

				{/* Move Up */}
				<MenuItem
					disabled={!onMoveUp}
					hideOnClick={false}
					className='dark-menu-item'
					onClick={onMoveUp}
				>
					<ArrowUpSvg className='h-3.5 w-4' />
					<p>Move Up</p>
				</MenuItem>

				{/* Move Down */}
				<MenuItem
					disabled={!onMoveDown}
					hideOnClick={false}
					className='dark-menu-item'
					onClick={onMoveDown}
				>
					<ArrowDownSvg className='h-3.5 w-4' />
					<p>Move Down</p>
				</MenuItem>

				{/* Add */}
				{onAdd && addOptions && (
					<AddMenu onAdd={onAdd} addOptions={addOptions} />
				)}

				{/* Move To */}
				{onMoveTo && moveToOptions && (
					<MoveMenu onMoveTo={onMoveTo} moveToOptions={moveToOptions} />
				)}

				{/* Convert Section to Category or other Section type */}
				{onConvert && convertOptions && onPromote && (
					<ConvertSectionMenu
						onConvert={onConvert}
						convertOptions={convertOptions}
						onPromote={onPromote}
					/>
				)}

				{/* Demote to Section */}
				{onDemote && demoteOptions && (
					<DemoteMenu onDemote={onDemote} demoteOptions={demoteOptions} />
				)}

				{/* Duplicate */}
				{onDuplicate && (
					<MenuItem className='dark-menu-item' onClick={onDuplicate}>
						<DoubleSquareSvg className='size-4' />
						<p>Duplicate</p>
					</MenuItem>
				)}

				{/* Delete */}
				<MenuItem
					className='dark-menu-item text-rose-300! data-active-item:bg-rose-300! data-active-item:text-rose-950!'
					onClick={onDelete}
				>
					<TrashSvg className='size-4' />
					<p>Delete</p>
				</MenuItem>
			</Menu>
		</MenuProvider>
	);
}

type AddMenuProps<AddOption> = {
	onAdd: (value: AddOption) => void;
	addOptions: {
		label: string;
		options: {
			label: string;
			value: AddOption;
			disabled?: boolean;
		}[];
	}[];
};

function AddMenu<AddOption>({ onAdd, addOptions }: AddMenuProps<AddOption>) {
	return (
		<MenuProvider placement='left-start'>
			<MenuItem render={<MenuButton />} className='dark-menu-item'>
				<MenuButtonArrow />
				<p>Add</p>
			</MenuItem>
			<Menu modal unmountOnHide fitViewport className='dark-menu p-0!'>
				<div className='flex flex-col gap-1 divide-y divide-zinc-600 overflow-y-auto px-2 py-1.5'>
					{addOptions.map(group => {
						return (
							<MenuGroup key={group.label} className='flex flex-col'>
								<MenuGroupLabel className='dark-menu-group-label'>
									{group.label}
								</MenuGroupLabel>
								{group.options.map(option => {
									return (
										<MenuItem
											key={option.label}
											className='dark-menu-item px-4! py-0.5!'
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
	);
}

type MoveMenuProps = {
	onMoveTo: (value: string) => void;
	moveToOptions: {
		label: string;
		value: string;
		type?:
			| WidgetSetting.Section['type']
			| WidgetSetting.MultiSection['type']
			| 'category';
		disabled?: boolean;
	}[];
};

function MoveMenu({ onMoveTo, moveToOptions }: MoveMenuProps) {
	return (
		<MenuProvider placement='left-start'>
			<MenuItem
				disabled={moveToOptions.length === 0}
				render={<MenuButton />}
				className='dark-menu-item'
			>
				<MenuButtonArrow />
				<p>Move To</p>
			</MenuItem>

			<Menu modal unmountOnHide fitViewport className='dark-menu p-0!'>
				<MenuGroup className='flex flex-col overflow-y-auto p-1.5'>
					{moveToOptions.map(option => {
						const isSection = 'type' in option && option.type !== 'category';

						return (
							<MenuItem
								key={option.label}
								disabled={option.disabled}
								className={clsx('dark-menu-item py-0.5!', isSection && 'pl-3')}
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
	);
}

type ConvertSectionMenuProps = {
	onConvert: (
		value: WidgetSetting.Section['type'] | WidgetSetting.MultiSection['type'],
	) => void;
	convertOptions: {
		label: string;
		value: WidgetSetting.Section['type'] | WidgetSetting.MultiSection['type'];
		disabled?: boolean;
	}[];
	onPromote: VoidFunction;
};

function ConvertSectionMenu({
	onConvert,
	convertOptions,
	onPromote,
}: ConvertSectionMenuProps) {
	return (
		<MenuProvider placement='left-start'>
			<MenuItem render={<MenuButton />} className='dark-menu-item'>
				<MenuButtonArrow />
				<p>Convert To</p>
			</MenuItem>

			<Menu unmountOnHide modal className='dark-menu'>
				<MenuItem onClick={onPromote} className='dark-menu-item'>
					<ArrowUpTraySvg className='size-4' />
					<p>Category</p>
				</MenuItem>

				{convertOptions.map(option => {
					return (
						<MenuItem
							key={option.label}
							disabled={option.disabled}
							onClick={() => {
								onConvert(option.value);
							}}
							className='dark-menu-item'
						>
							<ArrowLeftRightSvg className='size-4' />
							<p>{option.label}</p>
						</MenuItem>
					);
				})}
			</Menu>
		</MenuProvider>
	);
}

type DemoteMenuProps = {
	onDemote: (
		type: WidgetSetting.Section['type'] | WidgetSetting.MultiSection['type'],
		categoryId: string,
	) => void;
	demoteOptions: {
		label: string;
		value: string;
		disabled?: boolean;
	}[];
};

function DemoteMenu({ onDemote, demoteOptions }: DemoteMenuProps) {
	return (
		<MenuProvider placement='left-start'>
			<MenuItem
				disabled={demoteOptions.length === 0}
				render={<MenuButton />}
				className='dark-menu-item'
			>
				<MenuButtonArrow />
				<p>Convert to</p>
			</MenuItem>
			<Menu unmountOnHide modal className='dark-menu'>
				{DEMOTE_SECTIONS.map(type => {
					const label = SETTINGS_LABELS.get(type);
					if (!label) return null;

					return (
						<MenuProvider placement='left-start'>
							<MenuItem
								key={type}
								render={<MenuButton />}
								className='dark-menu-item'
							>
								<MenuButtonArrow />
								<p>{label}</p>
							</MenuItem>

							<Menu unmountOnHide modal fitViewport className='dark-menu p-0!'>
								<MenuGroup className='flex flex-col overflow-y-auto p-1.5'>
									<MenuGroupLabel className='p-1 text-3.5 text-zinc-300'>
										Convert to <strong className='font-bold'>{label}</strong> +
										Move to:
									</MenuGroupLabel>

									<MenuSeparator className='border-zinc-500 pb-1' />

									{demoteOptions.map(option => {
										return (
											<MenuItem
												key={option.label}
												disabled={option.disabled}
												className='dark-menu-item py-0.5!'
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
	);
}
