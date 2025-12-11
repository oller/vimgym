export const VIM_MOTIONS = {
	h: "Move cursor left",
	j: "Move cursor down",
	k: "Move cursor up",
	l: "Move cursor right",
	w: "Move forward one word",
	b: "Move backward one word",
	e: "Move to end of word",
	"0": "Move to beginning of line",
	$: "Move to end of line",
	i: "Insert before cursor",
	a: "Append after cursor",
	x: "Delete character under cursor",
	dd: "Delete line",
	dw: "Delete word",
	u: "Undo",
	"ctrl-r": "Redo",
	// Add more as needed
} as const;

export const getDescription = (key: string): string => {
	return VIM_MOTIONS[key] || "Unknown motion";
};
