import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

import type { TrendData } from "../../types";


export default function ReviewTrendChart({
    data,
}: {
    data: TrendData[];
}) {

    return (

        <div className="chart trend-chart">

            <h3>
                Review Trend
            </h3>

            <ResponsiveContainer
                width="100%"
                height={350}
            >

                <LineChart
                    data={data}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="month"
                    />

                    <YAxis />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="total"
                        name="Reviews"
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>
    );
}
