import React from "react";
import { UsageStatisticDto } from "../../../dtos";

interface PageUrlCellProps {
  statistics: UsageStatisticDto[];
}

const StatisticsCell = ({ statistics }: PageUrlCellProps) => {
  if (!statistics.length) return null;

  const total = statistics.reduce(
    (accumulator, statistic) => accumulator + statistic.usageCount,
    0
  );

  const isMultiStatistic = statistics.length > 1;

  return (
    <ol className="pointer-events--none">
      {statistics.map((statistic, index) => (
        <li key={index}>
          {statistic.pageTypeName}: {statistic.usageCount}
          {isMultiStatistic &&
            ` (${Math.round((statistic.usageCount / total) * 100)}%)`}
        </li>
      ))}
    </ol>
  );
};

export default StatisticsCell;
