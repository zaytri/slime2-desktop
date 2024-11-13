namespace Props {
	type WithClassName<PropType = unknown> = PropType & {
		className?: string;
	};

	type WithChildren<PropType = unknown> = React.PropsWithChildren<PropType>;

	type WithClassNameAndChildren<PropType = unknown> = WithClassName<
		WithChildren<PropType>
	>;
}
