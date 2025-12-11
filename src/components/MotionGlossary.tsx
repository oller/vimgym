import React from "react";
import { VIM_MOTIONS } from "../utils/vim-definitions";

export const MotionGlossary = () => {
	return (
		<div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-full overflow-y-auto">
			<h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
				Glossary
			</h3>
			<div className="grid grid-cols-1 gap-2">
				{Object.entries(VIM_MOTIONS).map(([key, desc]) => (
					<div
						key={key}
						className="flex items-center justify-between text-sm group hover:bg-gray-800 p-1 rounded transition-colors"
					>
						<span className="font-mono text-yellow-500 font-bold bg-gray-800 px-2 py-0.5 rounded border border-gray-700 group-hover:bg-gray-700">
							{key}
						</span>
						<span className="text-gray-400">{desc}</span>
					</div>
				))}
			</div>
		</div>
	);
};
