import React from "react";
import { UsageStatisticDto } from "../../../dtos";

interface PageUrlCellProps {
  statistics: UsageStatisticDto[];
}

const StatisticsCell = ({ statistics }: PageUrlCellProps) => {
  if (!statistics.length) return null;

  return (
    <ol>
      {statistics.map((statistic, index) => (
        <li key={index}>
          {statistic.pageTypeName}: {statistic.usageCount}
        </li>
      ))}
    </ol>
  );
};

export default StatisticsCell;
