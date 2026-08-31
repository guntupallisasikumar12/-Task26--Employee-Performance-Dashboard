import api from './axios';
import type { Department, EmployeeDetail, NewEmployee, NewReview, Review } from '../types';
import type { Employee } from '../types';

export interface EmployeeFilters {
    department?: string;
    search?: string;
}

// The create endpoint returns the bare row — no review_count/avg_rating,
// since those are computed only by the list query's JOIN + GROUP BY.
export interface CreatedEmployee {
    id: number;
    name: string;
    department: Department;
    email: string;
    joined_on: string;
}

export const fetchEmployees = (filters: EmployeeFilters): Promise<Employee[]> =>
    api.get('/employees', { params: filters }).then((r) => r.data);

export const fetchEmployee = (id: number): Promise<EmployeeDetail> =>
    api.get(`/employees/${id}`).then((r) => r.data);

export const createEmployee = (employee: NewEmployee): Promise<CreatedEmployee> =>
    api.post('/employees', employee).then((r) => r.data);

export const createReview = (review: NewReview): Promise<Review> =>
    api.post('/reviews', review).then((r) => r.data);

export const deleteReview = (id: number): Promise<{ message: string }> =>
    api.delete(`/reviews/${id}`).then((r) => r.data);