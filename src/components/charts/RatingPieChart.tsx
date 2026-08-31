import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Rating, RatingCount } from '../../types';

interface RatingPieChartProps {
    data: RatingCount[];
    isLoading: boolean;
}

const RATING_COLORS: Record<Rating, string> = {
    Excellent: 'var(--sage)',
    Good: 'var(--teal)',
    Average: 'var(--amber)',
    Poor: 'var(--coral)',
};

function RatingPieChart({ data, isLoading }: RatingPieChartProps) {
    if (isLoading) {
        return <div className="chart-card chart-card--skeleton" />;
    }

    return (
        <div className="chart-card">
            <p className="chart-card__title">Rating Distribution</p>
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="count"
                        nameKey="rating"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        strokeWidth={0}
                    >
                        {data.map((entry) => (
                            <Cell key={entry.rating} fill={RATING_COLORS[entry.rating]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: 'var(--surface-raised)',
                            border: '1px solid var(--line)',
                            borderRadius: 8,
                            color: 'var(--ink)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={32}
                        formatter={(value: string) => (
                            <span style={{ color: 'var(--ink-soft)', fontSize: 12 }}>{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default RatingPieChart;