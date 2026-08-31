import { useState } from 'react';

type Validator<T> = (values: T) => Partial<Record<keyof T, string>>;

interface UseFormReturn<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => void;
    validateForm: () => boolean;
    resetForm: () => void;
    setValues: React.Dispatch<React.SetStateAction<T>>;
}

// Generic form-state hook — <T> is whatever shape of fields the
// caller passes as initialValues (NewEmployee, NewReview, login
// fields, anything). `validate` is supplied by the caller so this
// hook stays reusable instead of hardcoding one form's rules.
function useForm<T extends object>(
    initialValues: T,
    validate: Validator<T>
): UseFormReturn<T> {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ): void {
        const { name, value } = e.target;
        setValues((current) => ({ ...current, [name]: value }));
    }

    function validateForm(): boolean {
        const nextErrors = validate(values);
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    function resetForm(): void {
        setValues(initialValues);
        setErrors({});
    }

    return { values, errors, handleChange, validateForm, resetForm, setValues };
}

export default useForm;