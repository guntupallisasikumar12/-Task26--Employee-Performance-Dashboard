import {
    useState,
} from "react";

import type {
    ChangeEvent,
} from "react";

export default function useForm<T extends Record<string, string>>(
    initialValues: T,
    validate: (
        values: T
    ) => Record<string, string>
) {

    const [values, setValues] =
        useState<T>(initialValues);

    const [errors, setErrors] =
        useState<Record<string, string>>({});


    const handleChange = (
        event: ChangeEvent<
            HTMLInputElement |
            HTMLSelectElement |
            HTMLTextAreaElement
        >
    ) => {

        const {
            name,
            value,
        } = event.target;

        setValues((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const validateForm = () => {

        const validationErrors =
            validate(values);

        setErrors(validationErrors);

        return (
            Object.keys(validationErrors)
                .length === 0
        );
    };


    const resetForm = () => {

        setValues(initialValues);

        setErrors({});
    };


    return {
        values,
        setValues,
        errors,
        handleChange,
        validateForm,
        resetForm,
    };
}
