type SvgComponent = React.ComponentType<Props.WithClassName>;

// thanks https://tkdodo.eu/blog/omit-for-discriminated-unions-in-type-script
type DistributiveOmit<Type, Key extends keyof Type> = Type extends any
	? Omit<Type, Key>
	: never;

// thanks https://stackoverflow.com/a/71996712
type Override<Base extends object, Type extends object> = Omit<
	Base,
	keyof Type
> &
	Type;
