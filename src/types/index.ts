// ─────────────────────────────────────────────
// All shared types/interfaces live in this file.
// Shapes here match what backend/app.py actually
// returns — verified against the real API, not guessed.
// ─────────────────────────────────────────────

export type Role = 'admin' | 'manager';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}

export type Department = 'Engineering' | 'Sales' | 'HR' | 'Marketing' | 'Finance';
export type Rating = 'Excellent' | 'Good' | 'Average' | 'Poor';

export interface Employee {
    id: number;
    name: string;
    department: Department;
    email: string;
    joined_on: string;
    review_count: number;
    avg_rating: number | null;
}

export interface Review {
    id: number;
    rating: Rating;
    review_notes: string | null;
    review_date: string;
    created_at: string | null;
    reviewer_name: string;
}

export interface EmployeeDetail {
    id: number;
    name: string;
    department: Department;
    email: string;
    joined_on: string;
    reviews: Review[];
}

export interface NewEmployee {
    name: string;
    department: Department | '';
    email: string;
    joined_on: string;
}

export interface NewReview {
    employee_id: number;
    rating: Rating | '';
    review_notes: string;
    review_date: string;
}

export interface Kpis {
    total_employees: number;
    total_reviews: number;
    avg_score: number;
    top_performer: string | null;
}

export interface DepartmentStat {
    department: Department;
    total_reviews: number;
    avg_score: number;
}

export interface RatingCount {
    rating: Rating;
    count: number;
}

export interface TrendPoint {
    month: string;
    total: number;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    logout: () => void;
}

export type ToastType = 'success' | 'error';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

// Generic shape useForm works against — any Record of string-ish
// field values, so it isn't tied to one specific form.
export type FormValues = Record<string, string | number>;
export type FormErrors<T> = Partial<Record<keyof T, string>>;