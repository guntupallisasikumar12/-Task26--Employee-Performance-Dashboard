import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { TrendPoint } from '../../types';

interface ReviewTrendChartProps {
    data: TrendPoint[];
    isLoading: boolean;
}

function ReviewTrendChart({ data, isLoading }: ReviewTrendChartProps) {
    if (isLoading) {
        return <div className="chart-card chart-card--skeleton" />;
    }

    return (
        <div className="chart-card chart-card--wide">
            <p className="chart-card__title">Review Volume — Last 6 Months</p>
            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data} margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                    <XAxis
                        dataKey="month"
                        stroke="var(--muted)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        stroke="var(--muted)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
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
                            return [Number(numeric ?? 0), 'Reviews'];
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="var(--teal)"
                        strokeWidth={2.5}
                        dot={{ fill: 'var(--teal)', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ReviewTrendChart;