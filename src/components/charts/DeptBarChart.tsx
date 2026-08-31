import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { DepartmentStat } from '../../types';

interface DeptBarChartProps {
    data: DepartmentStat[];
    isLoading: boolean;
}

function DeptBarChart({ data, isLoading }: DeptBarChartProps) {
    if (isLoading) {
        return <div className="chart-card chart-card--skeleton" />;
    }

    return (
        <div className="chart-card">
            <p className="chart-card__title">Average Rating by Department</p>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
                    <XAxis
                        type="number"
                        domain={[0, 4]}
                        stroke="var(--muted)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="department"
                        stroke="var(--muted)"
                        fontSize={12}
                        width={90}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'var(--line)' }}
                        contentStyle={{
                            background: 'var(--surface-raised)',
                            border: '1px solid var(--line)',
                            borderRadius: 8,
                            color: 'var(--ink)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                        }}
                        formatter={(value?: number | string | readonly (number | string)[]) => {
                            const numeric = Array.isArray(value) ? value[0] : value;
                            return [Number(numeric ?? 0).toFixed(2), 'Avg score'];
                        }}
                        labelFormatter={(label) => `Department: ${label}`}
                    />
                    <Bar dataKey="avg_score" fill="var(--teal)" radius={[0, 4, 4, 0]} barSize={22} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default DeptBarChart;