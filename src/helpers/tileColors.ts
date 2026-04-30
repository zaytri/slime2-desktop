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

export const tileColorClasses: Record<TileColor, string> = {
	[TileColor.Pink]: 'bg-pink-500 from-pink-300 to-rose-300',
	[TileColor.Red]: 'bg-red-500 from-rose-300 to-red-400',
	[TileColor.Orange]: 'bg-orange-500 from-orange-300 to-amber-400',
	[TileColor.Yellow]: 'bg-yellow-500 from-amber-300 to-yellow-400',
	[TileColor.Green]: 'bg-lime-500 from-lime-300 to-green-500',
	[TileColor.Teal]: 'bg-teal-500 from-green-300 to-teal-500',
	[TileColor.Blue]: 'bg-sky-500 from-cyan-300 to-sky-400',
	[TileColor.Purple]: 'bg-violet-500 from-purple-300 to-violet-400',
};
