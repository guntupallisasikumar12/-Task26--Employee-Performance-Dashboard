import type { KPIData } from "../../types";


export default function KPICards({
    data,
}: {
    data: KPIData;
}) {

    return (

        <div className="kpi-grid">

            <div className="kpi-card">

                <h4>
                    Total Employees
                </h4>

                <h2>
                    {data.total_employees}
                </h2>

            </div>


            <div className="kpi-card">

                <h4>
                    Total Reviews
                </h4>

                <h2>
                    {data.total_reviews}
                </h2>

            </div>


            <div className="kpi-card">

                <h4>
                    Average Rating
                </h4>

                <h2>
                    {data.average_rating}
                </h2>

            </div>


            <div className="kpi-card">

                <h4>
                    Top Performer
                </h4>

                <h2>
                    {data.top_performer}
                </h2>

            </div>

        </div>
    );
}
