import { EditorState } from "@codemirror/state";
import { getCM, vim } from "@replit/codemirror-vim";
import CodeMirror, { basicSetup, type EditorView } from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { VimStatusBar } from "./VimStatusBar";

export const VimEditor = () => {
	const {
		startText,
		updateText,
		addKeyStroke,
		isCompleted,
		nextLevel,
		checkAndUpdateHighScore,
	} = useGameStore();
	const [vimMode, setVimMode] = useState("normal");
	const isUpdatingRef = useRef(false);
	const isCompletedRef = useRef(isCompleted);
	const nextLevelRef = useRef(nextLevel);

	// Keep refs in sync with latest values
	useEffect(() => {
		isCompletedRef.current = isCompleted;
		nextLevelRef.current = nextLevel;
	}, [isCompleted, nextLevel]);

	// Check and update high score when level is completed
	useEffect(() => {
		if (isCompleted) {
			checkAndUpdateHighScore();
		}
	}, [isCompleted, checkAndUpdateHighScore]);

	const onChange = useCallback(
		(val: string) => {
			// Skip onChange during programmatic updates
			if (isUpdatingRef.current) return;
			updateText(val);
		},
		[updateText],
	);

	const onCreateEditor = useCallback(
		(editorView: EditorView) => {
			const cm = getCM(editorView);
			if (!cm) return;

			// Listen for mode changes
			cm.on("vim-mode-change", (e: any) => {
				setVimMode(e.mode);
			});

			// Listen for Vim command keys (normal mode, visual mode, etc.)
			cm.on("vim-keypress", (key: string) => {
				addKeyStroke(key);
			});

			// Listen for ALL keypresses (including insert mode typing)
			const handleKeyDown = (event: KeyboardEvent) => {
				// Skip modifier keys
				if (
					["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"].includes(
						event.key,
					)
				) {
					return;
				}

				// Log the key
				let key = event.key;
				if (key === "Escape") key = "Esc";
				if (key === "Enter") key = "Enter";
				if (key === " ") key = "Space";

				addKeyStroke(key);
			};

			editorView.dom.addEventListener("keydown", handleKeyDown);

			// Cleanup on unmount
			return () => {
				editorView.dom.removeEventListener("keydown", handleKeyDown);
			};
		},
		[addKeyStroke],
	);

	// Global keydown listener to intercept Enter when completed
	useEffect(() => {
		const handleGlobalKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Enter" && isCompletedRef.current) {
				event.preventDefault();
				event.stopPropagation();
				nextLevelRef.current();
			}
		};

		document.addEventListener("keydown", handleGlobalKeyDown, true); // Use capture phase

		return () => {
			document.removeEventListener("keydown", handleGlobalKeyDown, true);
		};
	}, []);

	// Make editor read-only when completed
	const extensions = [
		vim(), // vim bindings
		basicSetup(), // for correct highlighting in visual mode
		...(isCompleted ? [EditorState.readOnly.of(true)] : []),
	];

	return (
		<div
			data-testid="vim-editor"
			className={`border rounded-md overflow-hidden transition-colors flex flex-col ${isCompleted ? "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "border-gray-700"}`}
		>
			<CodeMirror
				value={startText}
				// height="120px"
				extensions={extensions}
				onChange={onChange}
				onCreateEditor={onCreateEditor}
				theme="dark"
				className="text-3xl flex-1"
				basicSetup={{
					lineNumbers: false,
					highlightActiveLine: true,
					autocompletion: false,
					closeBrackets: false,
				}}
			/>
			<VimStatusBar mode={vimMode} />
		</div>
	);
};
