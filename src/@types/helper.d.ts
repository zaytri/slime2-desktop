type SvgComponent = React.ComponentType<Props.WithClassName>;

// thanks https://tkdodo.eu/blog/omit-for-discriminated-unions-in-type-script
type DistributiveOmit<T, K extends keyof T> = T extends any
	? Omit<T, K>
	: never;
