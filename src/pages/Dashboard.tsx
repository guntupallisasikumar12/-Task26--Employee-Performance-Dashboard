import {
    useEffect,
    useState,
} from "react";

import api from "../api/axios";

import type {
    KPIData,
    DepartmentData,
    RatingData,
    TrendData,
} from "../types";

import Navbar from "../components/Navbar";

import KPICards from
    "../components/charts/KPICards";

import DeptBarChart from
    "../components/charts/DeptBarChart";

import RatingPieChart from
    "../components/charts/RatingPieChart";

import ReviewTrendChart from
    "../components/charts/ReviewTrendChart";


export default function Dashboard() {

    const [loading, setLoading] =
        useState(true);

    const [kpis, setKpis] =
        useState<KPIData | null>(null);

    const [departments, setDepartments] =
        useState<DepartmentData[]>([]);

    const [ratings, setRatings] =
        useState<RatingData[]>([]);

    const [trend, setTrend] =
        useState<TrendData[]>([]);


    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                const [
                    kpiResponse,
                    departmentResponse,
                    ratingResponse,
                    trendResponse,
                ] = await Promise.all([

                    api.get(
                        "/analytics/kpis"
                    ),

                    api.get(
                        "/analytics/by-department"
                    ),

                    api.get(
                        "/analytics/rating-distribution"
                    ),

                    api.get(
                        "/analytics/trend"
                    ),

                ]);


                setKpis(
                    kpiResponse.data
                );

                setDepartments(
                    departmentResponse.data
                );

                setRatings(
                    ratingResponse.data
                );

                setTrend(
                    trendResponse.data
                );

            } catch (error) {

                console.error(
                    "Dashboard error:",
                    error
                );

            } finally {

                setLoading(false);
            }
        };


        fetchDashboard();

    }, []);


    if (loading) {
        return (
            <p>
                Loading dashboard...
            </p>
        );
    }


    return (

        <>
            <Navbar />

            <main className="container">

                <h1>
                    Performance Dashboard
                </h1>

                {kpis && (
                    <KPICards
                        data={kpis}
                    />
                )}

                <div className="chart-grid">

                    <DeptBarChart
                        data={departments}
                    />

                    <RatingPieChart
                        data={ratings}
                    />

                </div>

                <ReviewTrendChart
                    data={trend}
                />

            </main>
        </>
    );
}
