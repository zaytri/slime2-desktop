import { useDialog } from '@/contexts/dialog/useDialog';
import { Account } from '@/helpers/json/accounts';
import twitchAuth from '@/helpers/services/twitch/twitchAuth';
import { memo, useState } from 'react';
import TwitchSvg from '../svg/TwitchSvg';
import DialogHeader from './DialogHeader';
import TwitchActivationDialog from './TwitchActivationDialog';

type AccountLoginDialogProps = {
	accountType: Account['type'];
};

const AccountLoginDialog = memo(function AccountLoginDialog({
	accountType,
}: AccountLoginDialogProps) {
	const [loading, setLoading] = useState(false);
	const { openDialog } = useDialog();

	return (
		<div className=''>
			<DialogHeader>Account Login</DialogHeader>

			{loading ? null : (
				<div className='pt-5'>
					<button
						className='group flex w-full items-center justify-center gap-2 rounded-2 border-2 border-violet-900 bg-[#9146FF] bg-linear-to-b from-[#9146FF] from-50% to-violet-600 to-50% p-3 font-radio-canada text-5 text-white shadow-[0_2px] shadow-violet-900 over:translate-y-0.5 over:bg-none over:shadow-none'
						onClick={() => {
							setLoading(true);

							twitchAuth.startDCF(accountType).then(response => {
								const { device_code, user_code, verification_uri } =
									response.data;

								openDialog(
									<TwitchActivationDialog
										deviceCode={device_code}
										userCode={user_code}
										verificationUri={verification_uri}
										accountType={accountType}
									/>,
								);
							});
						}}
					>
						<TwitchSvg className='size-6' />
						Twitch
					</button>
				</div>
			)}
		</div>
	);
});

export default AccountLoginDialog;
