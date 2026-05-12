type SvgComponent = React.ComponentType<Props.WithClassName>;

type Option<Value> = {
	label: string;
	value: NonUndefined<Value>;
	disabled?: boolean;
};

type GroupedOptions<Value> = {
	label: string;
	options: Option<NonUndefined<Value>>[];
	disabled?: boolean;
};
