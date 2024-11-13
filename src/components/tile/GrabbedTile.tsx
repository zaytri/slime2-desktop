import { memo } from 'react';

type GrabbedTileProps = {
	id: string;
};

export default memo(function GrabbedTile({ id }: GrabbedTileProps) {
	return <p>{id}</p>;
});
