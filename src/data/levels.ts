export type Level = {
	id: number;
	name: string;
	startText: string;
	targetText: string;
	description: string;
};

export const LEVELS = [
	{
		id: 1,
		name: "Delete Words",
		startText: "The quick brown fox jumps over the lazy dog.",
		targetText: "The quick brown fox jumps.",
		description: "Delete 'over the lazy dog' from the sentence",
	},
	{
		id: 2,
		name: "Flip Ternary",
		startText: "const activity = isSunny ? 'xbox' : 'golf'",
		targetText: "const activity = isSunny ? 'golf' : 'xbox'",
		description: "Swap 'golf' and 'xbox' in the ternary",
	},
	{
		id: 3,
		name: "Remove the hiccups!",
		startText: "The 2nd best time to hiccup plant a tree hiccup is now hiccup.",
		targetText: "The 2nd best time to plant a tree is now.",
		description: "The hiccups are annoying, remove them all",
	},
	{
		id: 4,
		name: "Extract Domain",
		startText: "Visit us at https://www.example.com/about for more info.",
		targetText: "Visit us at example.com for more info.",
		description: "Extract the domain from the URL",
	},
	{
		id: 5,
		name: "Clean Up List",
		startText: "- Apples\n- Bananas\n- Oranges\n- Grapes\n- Mangoes",
		targetText: "Apples, Bananas, Oranges, Grapes, Mangoes",
		description: "Convert the list into a comma-separated line",
	},
] as const satisfies Level[];

export const getLevel = (id: number) => {
	return LEVELS.find((level) => level.id === id);
};
