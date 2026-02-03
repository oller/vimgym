import { useMotionLog } from "./MotionLogContext";

export const MotionLogEmptyState = () => {
  const { isEmpty } = useMotionLog();
  if (!isEmpty) return null;
  return <span className="text-gray-600">Start typing...</span>;
};
