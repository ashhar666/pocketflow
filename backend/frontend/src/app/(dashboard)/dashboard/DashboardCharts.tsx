'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ThemeName = 'light' | 'dark' | string;

type TrendPoint = {
  month: string;
  income: number;
  expense: number;
  amount?: number;
};

type CategoryPoint = {
  name: string;
  amount: number;
  color: string;
};

type WeeklyPoint = {
  day: string;
  income: number;
  expense: number;
};

const formatCurrency = (val: number | string | undefined | null) => {
  const num = typeof val === 'string' ? parseFloat(val) : (val || 0);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(num));
};

const gridStroke = (theme: ThemeName) => (theme === 'dark' ? '#ffffff10' : '#00000005');
const axisStroke = (theme: ThemeName) => (theme === 'dark' ? '#3f3f46' : '#94a3b8');
const tooltipBackground = (theme: ThemeName) => (theme === 'dark' ? '#000000' : '#ffffff');

export function CashflowTrendChart({ data, theme }: { data: TrendPoint[]; theme: ThemeName }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke(theme)} />
        <XAxis
          dataKey="month"
          stroke={axisStroke(theme)}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          className="uppercase font-bold tracking-widest opacity-60"
        />
        <YAxis
          stroke={axisStroke(theme)}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => `INR ${val}`}
          className="font-bold tracking-widest opacity-60"
        />
        <Tooltip
          contentStyle={{ backgroundColor: tooltipBackground(theme), border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }}
          itemStyle={{ fontWeight: 'bold', fontSize: '10px' }}
          formatter={(value: any, name: any) => [formatCurrency(Number(value) || 0), String(name).toUpperCase()]}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
        <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
        <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name="Spending" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data, theme }: { data: CategoryPoint[]; theme: ThemeName }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={85}
          outerRadius={115}
          paddingAngle={8}
          dataKey="amount"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: tooltipBackground(theme), border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }}
          formatter={(value: any) => [formatCurrency(Number(value) || 0), 'VAL']}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          className="text-[10px] font-bold uppercase tracking-widest opacity-60"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function WeeklyBreakdownChart({ data, theme }: { data: WeeklyPoint[]; theme: ThemeName }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke(theme)} />
        <XAxis dataKey="day" stroke={axisStroke(theme)} fontSize={10} tickLine={false} axisLine={false} className="uppercase font-bold tracking-widest opacity-60" />
        <YAxis stroke={axisStroke(theme)} fontSize={10} tickLine={false} axisLine={false} className="font-bold tracking-widest opacity-60" tickFormatter={(value) => `INR ${value}`} />
        <Tooltip
          cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
          contentStyle={{ backgroundColor: tooltipBackground(theme), border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }}
          formatter={(value: any, name: any) => [formatCurrency(Number(value) || 0), String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
        <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  );
}
