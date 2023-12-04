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

  return (
    <ol>
      {statistics.map((statistic, index) => (
        <li key={index}>
          {statistic.pageTypeName}: {statistic.usageCount} (
          {Math.round((statistic.usageCount / total) * 100)}%)
        </li>
      ))}
    </ol>
  );
};

export default StatisticsCell;
