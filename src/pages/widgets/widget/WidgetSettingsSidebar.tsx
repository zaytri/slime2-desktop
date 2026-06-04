import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSettings } from '@@/json/widgetSettings';
import BookSvg from '@@/svg/BookSvg';
import UserSvg from '@@/svg/UserSvg';

type WidgetSettingsSidebarProps = {
	onClickCategory: (categoryId: string) => void;
	onClickSection: (sectionId: string, isMultiSection: boolean) => void;
	settings: WidgetSettings;
	topScrollId: string;
	aboutId: string;
	accountsId?: string;
};

export default function WidgetSettingsSidebar({
	settings,
	onClickCategory,
	onClickSection,
	topScrollId,
	aboutId,
	accountsId,
}: WidgetSettingsSidebarProps) {
	return (
		<aside className='relative flex w-56 flex-col justify-between gap-4 border-t border-zinc-500 pt-2'>
			<h2 className='absolute top-0 right-0 text-3 font-semibold text-zinc-500 uppercase'>
				Settings
			</h2>

			<div className='mt-3 flex flex-1 overflow-hidden rounded-r-2'>
				<div className='flex-1 overflow-y-auto pr-1'>
					<div className='flex flex-1 flex-col gap-1 text-white'>
						{accountsId && (
							<SidebarCategory
								label={
									<>
										<UserSvg className='size-5 drop-shadow-[0_2px_#0008]' />
										<p>Accounts</p>
									</>
								}
								onClick={() => {
									onClickCategory(accountsId);
								}}
								active={accountsId === topScrollId}
							/>
						)}

						{Object.entries(settings).map(([categoryId, category]) => {
							return (
								<SidebarCategory
									key={categoryId}
									label={i18nStringTransform(category.label)}
									onClick={() => {
										onClickCategory(categoryId);
									}}
									active={categoryId === topScrollId}
								>
									<ul className='flex flex-col pl-2'>
										{Object.entries(category.settings).map(
											([sectionId, section]) => {
												if (
													section.type !== 'section' &&
													section.type !== 'multi-section'
												)
													return null;

												return (
													<SidebarSubcategory
														key={sectionId}
														onClick={() => {
															onClickSection(
																sectionId,
																section.type === 'multi-section',
															);
														}}
													>
														{i18nStringTransform(section.label)}
													</SidebarSubcategory>
												);
											},
										)}
									</ul>
								</SidebarCategory>
							);
						})}

						<SidebarCategory
							label={
								<>
									<BookSvg className='size-5 drop-shadow-[0_2px_#0008]' />
									<p>About</p>
								</>
							}
							onClick={() => {
								onClickCategory(aboutId);
							}}
							active={aboutId === topScrollId}
						/>
					</div>
				</div>
			</div>
		</aside>
	);
}

type SidebarCategoryProps = {
	label: React.ReactNode;
	onClick: VoidFunction;
	active: boolean;
};

function SidebarCategory({
	label,
	children,
	onClick,
	active,
}: Props.WithChildren<SidebarCategoryProps>) {
	return (
		<section
			data-active={active || undefined}
			className='flex flex-col overflow-hidden rounded-1 px-1 -outline-offset-1 has-focus-visible:bg-white/10 has-focus-visible:outline has-focus-visible:outline-white/20 data-active:bg-white/10 data-active:outline data-active:outline-white/20 over:bg-white/10 over:outline over:outline-white/20'
		>
			<button
				className='px-1 text-left outline-none over:underline'
				onClick={onClick}
			>
				<h3 className='flex items-center gap-2 font-fredoka text-5 font-medium text-shadow-[0_2px_#0008]'>
					{label}
				</h3>
			</button>

			{children}
		</section>
	);
}

type SidebarSubcategoryProps = {
	onClick: VoidFunction;
};

function SidebarSubcategory({
	onClick,
	children,
}: Props.WithChildren<SidebarSubcategoryProps>) {
	return (
		<li className='flex flex-col'>
			<button
				className='relative pl-4 text-left font-fredoka text-4.5 outline-none text-shadow-[0_2px_#0008] over:underline'
				onClick={onClick}
			>
				<div className='absolute top-2.75 left-0 size-1.5 rounded-full bg-white shadow-[0_2px_#0008]'></div>
				{children}
			</button>
		</li>
	);
}
