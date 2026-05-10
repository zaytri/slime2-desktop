import TextField from '@/components/input_fields/TextField';

type UniqueIdFieldProps = {
	value: string;
	onChange: (value: string) => void;
	error: string;
};

export default function UniqueIdField({
	value,
	onChange,
	error,
}: UniqueIdFieldProps) {
	return (
		<div className='relative'>
			<TextField
				label='Unique ID'
				compact
				placeholder={'my-setting-id'}
				autoFocus
				value={value}
				onChange={onChange}
				inputClassName='font-mono!'
			/>

			{error && (
				<p className='absolute inset-y-1 right-1 flex items-center rounded-1 bg-rose-900 px-1.5 text-3.5 font-bold text-white outline outline-rose-950'>
					{error}
				</p>
			)}
		</div>
	);
}
