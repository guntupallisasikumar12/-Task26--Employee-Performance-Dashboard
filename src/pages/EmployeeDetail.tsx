import {
    useEffect,
    useState,
} from "react";

import type { FormEvent } from "react";

import { useParams } from "react-router-dom";

import api from "../api/axios";

import type {
    Employee,
    Review,
} from "../types";

import Navbar from "../components/Navbar";

import useForm from "../hooks/useForm";
import useToast from "../hooks/useToast";

import ToastContainer from "../components/ToastContainer";


export default function EmployeeDetail() {

    const { id } = useParams();


    const [employee, setEmployee] =
        useState<Employee | null>(null);


    const [reviews, setReviews] =
        useState<Review[]>([]);


    const {
        toasts,
        showToast,
    } = useToast();


    /*
     * Fetch employee details.
     *
     * The API function is defined INSIDE
     * useEffect so ESLint does not report
     * loadEmployee as a missing dependency.
     */
    useEffect(() => {

        let cancelled = false;


        const fetchEmployee = async () => {

            try {

                const response = await api.get(
                    `/employees/${id}`
                );


                /*
                 * Only update state if the component
                 * is still active.
                 */
                if (!cancelled) {

                    setEmployee(
                        response.data.employee
                    );

                    setReviews(
                        response.data.reviews
                    );
                }


            } catch (error) {

                console.error(
                    "Unable to load employee:",
                    error
                );


                if (!cancelled) {

                    showToast(
                        "Unable to load employee",
                        "error"
                    );
                }
            }
        };


        if (id) {
            fetchEmployee();
        }


        /*
         * Cleanup function.
         */
        return () => {

            cancelled = true;

        };

    }, [id, showToast]);


    /*
     * Review form validation.
     */
    const validate = (
        values: {
            rating: string;
            review_notes: string;
        }
    ) => {

        const errors: Record<string, string> = {};


        if (!values.rating) {

            errors.rating =
                "Rating is required";
        }


        return errors;
    };


    const {
        values,
        errors,
        handleChange,
        validateForm,
        resetForm,
    } = useForm(
        {
            rating: "",
            review_notes: "",
        },
        validate
    );


    /*
     * Add review.
     */
    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();


        if (!validateForm()) {
            return;
        }


        try {

            await api.post(
                "/reviews",
                {
                    employee_id: Number(id),

                    rating: values.rating,

                    review_notes:
                        values.review_notes,

                    review_date:
                        new Date()
                            .toISOString()
                            .split("T")[0],
                }
            );


            showToast(
                "Review added successfully",
                "success"
            );


            resetForm();


            /*
             * Refresh the review list after
             * successfully adding a review.
             */
            const response = await api.get(
                `/employees/${id}`
            );


            setEmployee(
                response.data.employee
            );

            setReviews(
                response.data.reviews
            );


        } catch (error) {

            console.error(
                "Unable to add review:",
                error
            );


            showToast(
                "Unable to add review",
                "error"
            );
        }
    };


    /*
     * Loading state.
     */
    if (!employee) {

        return (
            <>
                <Navbar />

                <main className="container">

                    <p>
                        Loading employee...
                    </p>

                </main>
            </>
        );
    }


    return (
        <>
            <Navbar />

            <main className="container">

                <h1>
                    {employee.name}
                </h1>


                <p>
                    <strong>
                        Department:
                    </strong>{" "}
                    {employee.department}
                </p>


                <p>
                    <strong>
                        Email:
                    </strong>{" "}
                    {employee.email}
                </p>


                <p>
                    <strong>
                        Joined On:
                    </strong>{" "}
                    {employee.joined_on}
                </p>


                <hr />


                <h2>
                    Add Review
                </h2>


                <form
                    onSubmit={handleSubmit}
                >

                    <label htmlFor="rating">
                        Rating
                    </label>


                    <select
                        id="rating"
                        name="rating"
                        value={values.rating}
                        onChange={handleChange}
                    >

                        <option value="">
                            Select Rating
                        </option>

                        <option value="Excellent">
                            Excellent
                        </option>

                        <option value="Good">
                            Good
                        </option>

                        <option value="Average">
                            Average
                        </option>

                        <option value="Poor">
                            Poor
                        </option>

                    </select>


                    {errors.rating && (

                        <p className="error">
                            {errors.rating}
                        </p>

                    )}


                    <label htmlFor="review_notes">
                        Review Notes
                    </label>


                    <textarea
                        id="review_notes"
                        name="review_notes"
                        placeholder="Enter review notes"
                        value={
                            values.review_notes
                        }
                        onChange={handleChange}
                        rows={5}
                    />


                    <button type="submit">
                        Add Review
                    </button>

                </form>


                <hr />


                <h2>
                    Review History
                </h2>


                {reviews.length === 0 ? (

                    <p>
                        No reviews available.
                    </p>

                ) : (

                    reviews.map((review) => (

                        <div
                            key={review.id}
                            className="review-card"
                        >

                            <h3>
                                {review.rating}
                            </h3>


                            <p>
                                {
                                    review.review_notes ||
                                    "No notes provided."
                                }
                            </p>


                            <small>
                                Reviewed by:
                                {" "}
                                {
                                    review.reviewer_name
                                }

                                {" | "}

                                {
                                    review.review_date
                                }
                            </small>

                        </div>

                    ))

                )}

            </main>


            <ToastContainer
                toasts={toasts}
            />

        </>
    );
}
