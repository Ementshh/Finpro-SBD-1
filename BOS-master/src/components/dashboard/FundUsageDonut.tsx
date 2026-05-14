import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface FundUsageDonutProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      fontSize={12} 
      textAnchor="middle" 
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const FundUsageDonut: React.FC<FundUsageDonutProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-72">
      <h3 className="text-lg font-semibold mb-4">BOS Fund Usage Categories</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart
          margin={{
            top: 40,
            right: 0,
            bottom: 0,
            left: 0,
          }}
        >
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(value)
            }
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 40 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FundUsageDonut;
