import useWidgetSettingsEditor from '@/contexts/widget_settings_editor/useWidgetSettingsEditor';
import { useWidgetSettingsEditorDispatch } from '@/contexts/widget_settings_editor/useWidgetSettingsEditorDispatch';
import { SECTION_OPTIONS, type WidgetSetting } from '@@/json/widgetSettings';
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

type DemoteCategoryMenuProps = {
	id: string;
};

export default function DemoteCategoryMenu({ id }: DemoteCategoryMenuProps) {
	const { categoryOptions, getCategory } = useWidgetSettingsEditor();
	const { demoteCategory } = useWidgetSettingsEditorDispatch();

	// get options, disabling the current category
	const options = categoryOptions.map(option => {
		return { ...option, disabled: id === option.value };
	});

	const category = getCategory(id);
	if (!category) return null;

	const noSections = Object.values(category.settings).every(setting => {
		return !('settings' in setting);
	});

	const onDemote = (
		newType: WidgetSetting.AnySection['type'],
		newCategoryId: string,
	) => {
		demoteCategory(id, category, newCategoryId, newType);
	};

	return (
		<MenuProvider placement='left-start'>
			<MenuItem
				disabled={
					options.length === 0 ||
					options.every(option => {
						return option.disabled;
					})
				}
				render={<MenuButton />}
				className='dark-menu-item'
			>
				<MenuButtonArrow />
				<p>Demote to</p>
			</MenuItem>
			<Menu unmountOnHide modal className='dark-menu'>
				{noSections ? (
					SECTION_OPTIONS.map(sectionTypeOption => {
						return (
							<MenuProvider
								key={sectionTypeOption.label}
								placement='left-start'
							>
								<MenuItem
									key={sectionTypeOption.label}
									render={<MenuButton />}
									className='dark-menu-item'
								>
									<MenuButtonArrow />
									<p>{sectionTypeOption.label}</p>
								</MenuItem>

								<Menu
									unmountOnHide
									modal
									fitViewport
									className='dark-menu p-0!'
								>
									<MenuGroup className='flex flex-col overflow-y-auto p-1.5'>
										<MenuGroupLabel className='p-1 text-3.5 text-zinc-300'>
											Demote to{' '}
											<strong className='font-bold'>
												{sectionTypeOption.label}
											</strong>{' '}
											+ Move to:
										</MenuGroupLabel>

										<MenuSeparator className='border-zinc-500 pb-1' />

										{options.map(sectionOption => {
											return (
												<MenuItem
													key={sectionOption.label}
													disabled={sectionOption.disabled}
													className='dark-menu-item py-0.5!'
													onClick={() => {
														onDemote(
															sectionTypeOption.value,
															sectionOption.value,
														);
													}}
												>
													{sectionOption.label}
												</MenuItem>
											);
										})}
									</MenuGroup>
								</Menu>
							</MenuProvider>
						);
					})
				) : (
					<MenuItem className='dark-menu-item flex flex-col items-start gap-0'>
						<p>Cannot demote Category while it</p>
						<p>contains a Section or Multi-Section</p>
					</MenuItem>
				)}
			</Menu>
		</MenuProvider>
	);
}
