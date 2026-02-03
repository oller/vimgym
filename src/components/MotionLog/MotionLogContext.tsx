import { createContext, useContext } from "react";

export type MotionCommand = {
  matched: string;
  explanation: string;
};

type MotionLogContextValue = {
  commands: MotionCommand[];
  isEmpty: boolean;
};

export const MotionLogContext = createContext<
  MotionLogContextValue | undefined
>(undefined);

export const useMotionLog = () => {
  const context = useContext(MotionLogContext);
  if (!context) {
    throw new Error("useMotionLog must be used within a MotionLog.Root");
  }
  return context;
};
