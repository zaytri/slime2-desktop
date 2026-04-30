import CheckSvg from '@@/svg/CheckSvg';
import ExclamationTriangleSvg from '@@/svg/ExclamationTriangleSvg';
import Tag from './Tag';

type AccountStatusTagProps = {
	mini?: boolean;
};

export function AccountDefaultTag({ mini }: AccountStatusTagProps) {
	return (
		<Tag
			label='Default'
			icon={<CheckSvg className='size-4' />}
			className='border-emerald-700 bg-emerald-600'
			mini={mini}
		/>
	);
}

export function AccountReauthTag({ mini }: AccountStatusTagProps) {
	return (
		<Tag
			label='Error!'
			icon={<ExclamationTriangleSvg className='size-4' />}
			className='border-rose-900 bg-rose-800'
			mini={mini}
		/>
	);
}
