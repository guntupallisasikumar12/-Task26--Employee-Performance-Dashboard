import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useForm from '../hooks/useForm';
import useToast from '../hooks/useToast';
import { createReview, fetchEmployee } from '../api/employees';
import type { EmployeeDetail as EmployeeDetailType, NewReview, Rating } from '../types';

const RATINGS: Rating[] = ['Excellent', 'Good', 'Average', 'Poor'];

interface ReviewFormFields {
    rating: Rating | '';
    review_notes: string;
    review_date: string;
}

function validateReview(
    values: ReviewFormFields
): Partial<Record<keyof ReviewFormFields, string>> {
    const errors: Partial<Record<keyof ReviewFormFields, string>> = {};
    if (!values.rating) errors.rating = 'Pick a rating.';
    if (!values.review_date) errors.review_date = 'Review date is required.';
    return errors;
}

const emptyReview: ReviewFormFields = { rating: '', review_notes: '', review_date: '' };

function EmployeeDetail() {
    const { id } = useParams<{ id: string }>();
    const employeeId = Number(id);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [employee, setEmployee] = useState<EmployeeDetailType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { values, errors, handleChange, validateForm, resetForm } =
        useForm<ReviewFormFields>(emptyReview, validateReview);

    function loadEmployee(): void {
        setIsLoading(true);
        fetchEmployee(employeeId)
            .then(setEmployee)
            .catch(() => showToast('Could not load this employee.', 'error'))
            .finally(() => setIsLoading(false));
    }

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                setIsLoading(true);

                const response = await fetch(
                    `http://localhost:5000/api/employees/${employeeId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch employee");
                }

                const data = await response.json();

                setEmployee(data);
            } catch (error) {
                console.error("Error loading employee:", error);

            } finally {
                setIsLoading(false);
            }
        };

        void fetchEmployee();
    }, [employeeId]);

    async function handleAddReview(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload: NewReview = {
                employee_id: employeeId,
                rating: values.rating,
                review_notes: values.review_notes,
                review_date: values.review_date,
            };
            await createReview(payload);
            showToast('Review added.', 'success');
            resetForm();
            loadEmployee();
        } catch (err) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? 'Could not add review.';
            showToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="app-shell">
            <Navbar />
            <main className="page page--narrow">
                <button className="back-link" onClick={() => navigate('/employees')}>
                    ← Back to Employees
                </button>

                {isLoading && <p className="empty-note">Loading…</p>}

                {employee && (
                    <>
                        <div className="detail-card">
                            <h1 className="detail-card__title">{employee.name}</h1>
                            <dl className="detail-card__meta">
                                <div>
                                    <dt>Department</dt>
                                    <dd>{employee.department}</dd>
                                </div>
                                <div>
                                    <dt>Email</dt>
                                    <dd>{employee.email}</dd>
                                </div>
                                <div>
                                    <dt>Joined</dt>
                                    <dd>{employee.joined_on}</dd>
                                </div>
                                <div>
                                    <dt>Total reviews</dt>
                                    <dd>{employee.reviews.length}</dd>
                                </div>
                            </dl>
                        </div>

                        <section className="review-form-card">
                            <h2 className="section-heading">Add a review</h2>
                            <form onSubmit={handleAddReview}>
                                <div className="field-row">
                                    <label className="field">
                                        <span className="field__label">Rating</span>
                                        <select
                                            className="field__input"
                                            name="rating"
                                            value={values.rating}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select…</option>
                                            {RATINGS.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.rating && (
                                            <span className="field__error">{errors.rating}</span>
                                        )}
                                    </label>

                                    <label className="field">
                                        <span className="field__label">Review date</span>
                                        <input
                                            className="field__input"
                                            type="date"
                                            name="review_date"
                                            value={values.review_date}
                                            onChange={handleChange}
                                        />
                                        {errors.review_date && (
                                            <span className="field__error">{errors.review_date}</span>
                                        )}
                                    </label>
                                </div>

                                <label className="field">
                                    <span className="field__label">Notes</span>
                                    <textarea
                                        className="field__input field__textarea"
                                        name="review_notes"
                                        rows={3}
                                        value={values.review_notes}
                                        onChange={handleChange}
                                    />
                                </label>

                                <button className="btn-primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Adding…' : 'Add Review'}
                                </button>
                            </form>
                        </section>

                        <section>
                            <h2 className="section-heading">Review history</h2>
                            {employee.reviews.length === 0 ? (
                                <p className="empty-note">No reviews yet.</p>
                            ) : (
                                <ul className="review-list">
                                    {employee.reviews.map((review) => (
                                        <li key={review.id} className="review-item">
                                            <div className="review-item__top">
                                                <span className={`rating-badge rating-badge--${review.rating}`}>
                                                    {review.rating}
                                                </span>
                                                <span className="review-item__date">{review.review_date}</span>
                                            </div>
                                            {review.review_notes && (
                                                <p className="review-item__notes">{review.review_notes}</p>
                                            )}
                                            <p className="review-item__reviewer">— {review.reviewer_name}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default EmployeeDetail;