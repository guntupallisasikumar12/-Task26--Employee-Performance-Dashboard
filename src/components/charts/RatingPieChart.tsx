import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import type { RatingData } from "../../types";


const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
];


export default function RatingPieChart({
    data,
}: {
    data: RatingData[];
}) {

    return (

        <div className="chart">

            <h3>
                Rating Distribution
            </h3>

            <ResponsiveContainer
                width="100%"
                height={300}
            >

                <PieChart>

                    <Pie
                        data={data}
                        dataKey="count"
                        nameKey="rating"
                        outerRadius={100}
                        label
                    >

                        {data.map(
                            (_, index) => (

                                <Cell
                                    key={index}
                                    fill={
                                        COLORS[
                                        index %
                                        COLORS.length
                                        ]
                                    }
                                />

                            )
                        )}

                    </Pie>

                    <Tooltip />

                    <Legend />

                </PieChart>

            </ResponsiveContainer>

        </div>
    );
}
