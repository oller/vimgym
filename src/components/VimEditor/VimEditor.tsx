import { useCallback, useEffect } from "react";
import { getLevel, LEVELS } from "../../data/levels";
import { useLevelId } from "../../hooks/useLevelId";
import { useGameStore } from "../../store/useGameStore";
import { BaseVimEditor } from "./BaseVimEditor";

export const VimEditor = () => {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const startText = useGameStore((state) => state.startText);
  const targetText = useGameStore((state) => state.targetText);
  const updateText = useGameStore((state) => state.updateText);
  const addKeyStroke = useGameStore((state) => state.addKeyStroke);
  const resetLevel = useGameStore((state) => state.resetLevel);
  const setPoweredOff = useGameStore((state) => state.setPoweredOff);
  const isCompleted = useGameStore((state) => state.isCompleted);
  const history = useGameStore((state) => state.history);
  const [, setLevelId] = useLevelId();

  const handleSelectLevelIndex = useCallback(
    (levelIndex: number) => {
      if (levelIndex < 1 || levelIndex > LEVELS.length) {
        return;
      }
      const level = LEVELS[levelIndex - 1];
      if (level) {
        setLevelId(level.id);
      }
    },
    [setLevelId],
  );

  const handlePowerOff = useCallback(() => {
    setPoweredOff(true);
  }, [setPoweredOff]);

  // Global keydown listener to intercept Enter when completed
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && isCompleted) {
        event.preventDefault();
        event.stopPropagation();

        const currentIndex = LEVELS.findIndex((l) => l.id === currentLevel);
        if (currentIndex !== -1 && currentIndex < LEVELS.length - 1) {
          setLevelId(LEVELS[currentIndex + 1].id);
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [setLevelId, isCompleted, currentLevel]);

  const levelObj = getLevel(currentLevel);
  const lang = levelObj?.language || "markdown";

  return (
    <BaseVimEditor
      editorKey={currentLevel}
      historyCount={history.length}
      isCompleted={isCompleted}
      language={lang}
      onChangeText={updateText}
      onKeyStroke={addKeyStroke}
      onPowerOff={handlePowerOff}
      onReset={resetLevel}
      onSelectLevelIndex={handleSelectLevelIndex}
      showInlineTarget
      startText={startText}
      targetText={targetText}
    />
  );
};
