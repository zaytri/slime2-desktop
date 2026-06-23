type DistributiveOmit<Type, Key extends keyof Type> = Type extends any
	? Omit<Type, Key>
	: never;

type Override<Base extends object, Type extends object> = Omit<
	Base,
	keyof Type
> &
	Type;

type DistributiveOverride<
	Base extends object,
	Type extends object,
> = DistributiveOmit<Base, keyof Type> & Type;

type DistributivePick<Type, Key extends keyof Type> = Type extends any
	? Pick<Type, Key>
	: never;

type KeysOfUnion<Type> = Type extends Type ? keyof Type : never;

type NonUndefined<Type> = Type extends undefined ? never : Type;

type IfAllPropertiesOptional<Type, BranchTrue, BranchFalse> =
	Partial<Record<string, unknown>> extends Type ? BranchTrue : BranchFalse;

type AsyncEventListener = (event: Event) => Promise<void>;
