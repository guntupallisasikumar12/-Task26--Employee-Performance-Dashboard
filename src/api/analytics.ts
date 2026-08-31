import api from './axios';
import type { DepartmentStat, Kpis, RatingCount, TrendPoint } from '../types';

export const fetchKpis = (): Promise<Kpis> =>
    api.get('/analytics/kpis').then((r) => r.data);

export const fetchByDepartment = (): Promise<DepartmentStat[]> =>
    api.get('/analytics/by-department').then((r) => r.data);

export const fetchRatingDistribution = (): Promise<RatingCount[]> =>
    api.get('/analytics/rating-distribution').then((r) => r.data);

export const fetchTrend = (): Promise<TrendPoint[]> =>
    api.get('/analytics/trend').then((r) => r.data);