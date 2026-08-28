export interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "manager";
}

export interface Employee {
    id: number;
    name: string;
    department: string;
    email: string;
    joined_on: string;
    review_count: number;
    average_rating: number | null;
}

export interface Review {
    id: number;
    rating: "Excellent" | "Good" | "Average" | "Poor";
    review_notes: string;
    review_date: string;
    reviewer_name: string;
}

export interface KPIData {
    total_employees: number;
    total_reviews: number;
    average_rating: number;
    top_performer: string;
}

export interface DepartmentData {
    department: string;
    total_reviews: number;
    avg_score: number;
}

export interface RatingData {
    rating: string;
    count: number;
}

export interface TrendData {
    month: string;
    total: number;
}

export interface Toast {
    id: number;
    message: string;
    type: "success" | "error";
}

