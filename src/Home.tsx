import { GoalDisplay } from "./components/GoalDisplay";
import { LevelSelector } from "./components/LevelSelector";
import { MotionLog } from "./components/MotionLog";
import { VimEditor } from "./components/VimEditor";

const Home = () => {
	return (
		<div className="min-h-screen bg-gray-950 text-white flex flex-col p-4 md:p-8 font-sans">
			<header className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
				<div>
					<h1 className="text-3xl font-bold text-white">VimGolf ⛳</h1>
					<p className="text-gray-400 text-sm mt-1">
						Master Vim motions through practice
					</p>
				</div>
			</header>

			<main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
				{/* Main Content */}
				<section className="md:col-span-9 lg:col-span-10 flex flex-col gap-6">
					<GoalDisplay />

					<div className="flex flex-col gap-4">
						<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
							Editor
						</h3>
						<VimEditor />
					</div>

					<MotionLog />
				</section>

				{/* Right: Level Selector */}
				<aside className="md:col-span-3 lg:col-span-2">
					<LevelSelector />
				</aside>
			</main>

			<footer className="mt-8 text-center text-gray-600 text-xs border-t border-gray-800 pt-4">
				&copy; 2025 VimGolf. Built with TanStack Start, React, Tailwind, and
				CodeMirror.
			</footer>
		</div>
	);
};

export default Home;
