type SvgComponent = React.ComponentType<Props.WithClassName>;

type Option<Value> = {
	label: string;
	value: Value;
	disabled?: boolean;
};

type GroupedOptions<Value> = {
	label: string;
	options: Option<Value>[];
	disabled?: boolean;
};
