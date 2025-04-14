import { memo } from 'react';

type GrabbedTileProps = {
	id: string;
};

const GrabbedTile = memo(function GrabbedTile({ id }: GrabbedTileProps) {
	return <p>{id}</p>;
});

export default GrabbedTile;
