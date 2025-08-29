import AccountPreview from '@/components/AccountPreview';
import LinkifyText from '@/components/LinkifyText';
import useAccounts from '@/contexts/accounts/useAccounts';
import { Account } from '@/helpers/json/accounts';
import { WidgetMeta } from '@/helpers/json/widgetMeta';
import { getWidgetIconSrc } from '@/helpers/media';
import { useParams } from '@tanstack/react-router';
import { memo } from 'react';

const WidgetInfo = memo(function WidgetInfo(meta: Props.WithId<WidgetMeta>) {
	const { widgetId } = useParams({ from: '/widget/$widgetId' });
	const accounts = useAccounts();

	const values = [
		['Creator', meta.creator],
		['Support', meta.support],
		['Homepage', meta.homepage],
	];

	return (
		<div id={meta.id} className='flex gap-4 p-4'>
			<div className='flex flex-1 flex-col gap-2'>
				<h2 className='text-7 border-b-2 border-stone-300 font-medium'>
					{meta.name} <span className='text-stone-400'>v{meta.version}</span>
				</h2>

				{values.map(([label, value]) => {
					if (!value) return null;

					return (
						<div key={label} className='flex flex-col'>
							<p className='text-3 font-semibold text-stone-400 uppercase'>
								{label}
							</p>
							<LinkifyText
								className='text-4.5 font-medium'
								linkClassName='text-lime-600'
							>
								{value}
							</LinkifyText>
						</div>
					);
				})}

				{meta.accounts && meta.accounts.length > 0 && (
					<div className='flex flex-col gap-2'>
						<p className='text-3 font-semibold text-stone-400 uppercase'>
							Accounts
						</p>
						<div className='flex gap-2'>
							{meta.accounts?.map((accountSlot, index) => {
								let slottedAccount: Account | null = null;
								for (const account of Object.values(accounts)) {
									if (
										accountSlot.type === account.type &&
										accountSlot.service === account.service &&
										account.default
									) {
										slottedAccount = account;
									}

									if (account.widgets[widgetId] === index) {
										slottedAccount = account;
										break;
									}
								}

								if (slottedAccount) {
									return (
										<AccountPreview
											key={slottedAccount.id}
											account={slottedAccount}
										/>
									);
								}

								return (
									<span className='text-rose-600' key={`missing_${index}`}>
										account missing, add account in settings
									</span>
								);
							})}
						</div>
					</div>
				)}
			</div>

			{meta.icon && (
				<img
					src={getWidgetIconSrc(widgetId, meta.icon)}
					className='rounded-2 max-h-48 max-w-48 self-center object-contain'
				/>
			)}
		</div>
	);
});

export default WidgetInfo;
