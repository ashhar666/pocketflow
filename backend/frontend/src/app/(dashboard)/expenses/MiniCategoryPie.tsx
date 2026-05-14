'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CategoryEntry {
  name: string;
  amount: number;
  color?: string;
}

interface Props {
  data?: CategoryEntry[];
}

export default function MiniCategoryPie({ data }: Props) {
  const chartData = data && data.length > 0 ? data : [{ name: 'No Data', amount: 1 }];

  return (
    <div className="h-[40px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={12}
            outerRadius={20}
            paddingAngle={2}
            dataKey="amount"
          >
            {data && data.length > 0 ? (
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#f43f5e'} />
              ))
            ) : (
              <Cell fill="var(--muted, #3f3f46)" />
            )}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
