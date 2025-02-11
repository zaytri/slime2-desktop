export enum TileColor {
	Pink = 'pink',
	Red = 'red',
	Orange = 'orange',
	Yellow = 'yellow',
	Green = 'green',
	Teal = 'teal',
	Blue = 'blue',
	Purple = 'purple',
}

export const tileColorClasses: Record<
	TileColor,
	{
		main: string;
		bg75: string;
	}
> = {
	[TileColor.Pink]: {
		main: 'bg-pink-400',
		bg75: 'bg-pink-400/75',
	},
	[TileColor.Red]: {
		main: 'bg-red-400',
		bg75: 'bg-red-400/75',
	},
	[TileColor.Orange]: {
		main: 'bg-orange-400',
		bg75: 'bg-orange-400/75',
	},
	[TileColor.Yellow]: {
		main: 'bg-yellow-400',
		bg75: 'bg-yellow-400/75',
	},
	[TileColor.Green]: {
		main: 'bg-lime-400',
		bg75: 'bg-lime-400/75',
	},
	[TileColor.Teal]: {
		main: 'bg-teal-400',
		bg75: 'bg-teal-400/75',
	},
	[TileColor.Blue]: {
		main: 'bg-sky-400',
		bg75: 'bg-sky-400/75',
	},
	[TileColor.Purple]: {
		main: 'bg-violet-400',
		bg75: 'bg-violet-400/75',
	},
};
