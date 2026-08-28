import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import type { DepartmentData } from "../../types";


export default function DeptBarChart({
    data,
}: {
    data: DepartmentData[];
}) {

    return (

        <div className="chart">

            <h3>
                Department Performance
            </h3>

            <ResponsiveContainer
                width="100%"
                height={300}
            >

                <BarChart
                    data={data}
                    layout="vertical"
                >

                    <XAxis
                        type="number"
                        domain={[0, 4]}
                    />

                    <YAxis
                        type="category"
                        dataKey="department"
                    />

                    <Tooltip />

                    <Bar
                        dataKey="avg_score"
                        name="Average Score"
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>
    );
}
