import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import KPICards from '../components/charts/KPICards';
import DeptBarChart from '../components/charts/DeptBarChart';
import RatingPieChart from '../components/charts/RatingPieChart';
import ReviewTrendChart from '../components/charts/ReviewTrendChart';
import useToast from '../hooks/useToast';
import {
    fetchByDepartment,
    fetchKpis,
    fetchRatingDistribution,
    fetchTrend,
} from '../api/analytics';
import type { DepartmentStat, Kpis, RatingCount, TrendPoint } from '../types';

function Dashboard() {
    const { showToast } = useToast();

    const [kpis, setKpis] = useState<Kpis | null>(null);
    const [byDepartment, setByDepartment] = useState<DepartmentStat[]>([]);
    const [ratingDistribution, setRatingDistribution] = useState<RatingCount[]>([]);
    const [trend, setTrend] = useState<TrendPoint[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {

        // All four analytics calls fire together — none of them depend
        // on each other, so there's no reason to wait on one before
        // starting the next.
        Promise.all([
            fetchKpis(),
            fetchByDepartment(),
            fetchRatingDistribution(),
            fetchTrend(),
        ])
            .then(([kpisData, deptData, ratingData, trendData]) => {
                setKpis(kpisData);
                setByDepartment(deptData);
                setRatingDistribution(ratingData);
                setTrend(trendData);
            })
            .catch(() => showToast('Could not load dashboard data.', 'error'))
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="app-shell">
            <Navbar />
            <main className="page">
                <h1 className="page__heading">Dashboard</h1>
                <p className="page__subheading">Live analytics across the whole team.</p>

                <KPICards kpis={kpis} isLoading={isLoading} />

                <div className="charts-row">
                    <DeptBarChart data={byDepartment} isLoading={isLoading} />
                    <RatingPieChart data={ratingDistribution} isLoading={isLoading} />
                </div>

                <ReviewTrendChart data={trend} isLoading={isLoading} />
            </main>
        </div>
    );
}

export default Dashboard;