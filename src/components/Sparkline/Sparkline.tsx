import { motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "../../utils/cn";

export type SparklineDataPoint = {
  score: number;
  count: number;
};

type SparklineProps = {
  data: SparklineDataPoint[];
  className?: string;
  onHover?: (point: SparklineDataPoint | null) => void;
};

export const Sparkline = ({ data, className, onHover }: SparklineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gradientId = useId();

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions((prev) =>
          prev.width === width && prev.height === height
            ? prev
            : { width, height },
        );
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const points = useMemo(() => {
    if (!data.length || dimensions.width === 0) return [];

    const maxCount = Math.max(...data.map((d) => d.count));
    const minScore = Math.min(...data.map((d) => d.score));
    const maxScore = Math.max(...data.map((d) => d.score));

    // Normalize data to fit measured width/height
    const scoreRange = maxScore - minScore || 1;
    const countRange = maxCount || 1;

    return data.map((d) => ({
      x: ((d.score - minScore) / scoreRange) * dimensions.width,
      y: dimensions.height - (d.count / countRange) * dimensions.height,
      original: d,
    }));
  }, [data, dimensions]);

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    return points.reduce(
      (acc, point, i) =>
        i === 0 ? `M ${point.x},${point.y}` : `${acc} L ${point.x},${point.y}`,
      "",
    );
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return "";
    return `${pathD} L ${points[points.length - 1].x},${dimensions.height} L ${points[0].x},${dimensions.height} Z`;
  }, [pathD, points, dimensions.height]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!points.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Find closest point by X coordinate
    let closestIndex = 0;
    let minDiff = Infinity;

    points.forEach((point, i) => {
      const diff = Math.abs(point.x - x);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    if (closestIndex !== hoverIndex) {
      setHoverIndex(closestIndex);
      onHover?.(points[closestIndex].original);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    onHover?.(null);
  };

  if (!data.length) return null;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {dimensions.width > 0 && (
        <svg
          aria-label="Score distribution chart"
          className="size-full overflow-visible"
          height={dimensions.height}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          role="img"
          width={dimensions.width}
        >
          <title>Score distribution chart</title>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-tokyo-night-lavender)"
                stopOpacity="0.5"
              />
              <stop
                offset="100%"
                stopColor="var(--color-tokyo-night-lavender)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Area */}
          <motion.path
            animate={{ opacity: 1 }}
            d={areaD}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />

          {/* Line */}
          <motion.path
            animate={{ pathLength: 1 }}
            d={pathD}
            fill="none"
            initial={{ pathLength: 0 }}
            stroke="var(--color-tokyo-night-lavender)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {/* Hover Highlight */}
          {activePoint && (
            <g>
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                fill="var(--color-tokyo-night-bg)"
                r="4"
                stroke="var(--color-tokyo-night-lavender)"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      )}
    </div>
  );
};
