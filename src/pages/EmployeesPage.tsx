import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useDebounce from '../hooks/useDebounce';
import useForm from '../hooks/useForm';
import useToast from '../hooks/useToast';
import { useAuth } from '../context/useAuth';
import { createEmployee, fetchEmployees } from '../api/employees';
import type { Department, Employee, NewEmployee } from '../types';

const DEPARTMENTS: Department[] = ['Engineering', 'Sales', 'HR', 'Marketing', 'Finance'];

function validateEmployee(
    values: NewEmployee
): Partial<Record<keyof NewEmployee, string>> {
    const errors: Partial<Record<keyof NewEmployee, string>> = {};
    if (!values.name.trim()) errors.name = 'Name is required.';
    if (!values.department) errors.department = 'Pick a department.';
    if (!values.email.trim()) errors.email = 'Email is required.';
    if (!values.joined_on) errors.joined_on = 'Joining date is required.';
    return errors;
}

const emptyEmployee: NewEmployee = { name: '', department: '', email: '', joined_on: '' };

function EmployeesPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [department, setDepartment] = useState<Department | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const debouncedSearch = useDebounce(search, 300);

    const { values, errors, handleChange, validateForm, resetForm } =
        useForm<NewEmployee>(emptyEmployee, validateEmployee);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const data = await fetchEmployees({
                    search: debouncedSearch || undefined,
                    department:
                        department === 'all' ? undefined : department,
                });

                setEmployees(data);
            } catch {
                showToast('Could not load employees.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        void loadEmployees();
    }, [debouncedSearch, department, showToast]);

    async function handleAddEmployee(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await createEmployee(values as NewEmployee);
            showToast('Employee added.', 'success');
            resetForm();
            setIsModalOpen(false);
            // Refresh the list with current filters.
            const refreshed = await fetchEmployees({
                search: debouncedSearch || undefined,
                department: department === 'all' ? undefined : department,
            });
            setEmployees(refreshed);
        } catch (err) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? 'Could not add employee.';
            showToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="app-shell">
            <Navbar />
            <main className="page">
                <div className="page__head-row">
                    <div>
                        <h1 className="page__heading">Employees</h1>
                        <p className="page__subheading">
                            Search updates 300ms after you stop typing — not on every keystroke.
                        </p>
                    </div>
                    {user?.role === 'admin' && (
                        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                            + Add Employee
                        </button>
                    )}
                </div>

                <div className="filterbar">
                    <input
                        className="filterbar__search"
                        type="text"
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="filterbar__select"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value as Department | 'all')}
                    >
                        <option value="all">All departments</option>
                        {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>

                {isLoading ? (
                    <p className="empty-note">Loading employees…</p>
                ) : employees.length === 0 ? (
                    <p className="empty-note">No employees match these filters.</p>
                ) : (
                    <table className="emp-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Email</th>
                                <th>Reviews</th>
                                <th>Avg Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id} onClick={() => navigate(`/employees/${emp.id}`)}>
                                    <td>{emp.name}</td>
                                    <td>{emp.department}</td>
                                    <td>{emp.email}</td>
                                    <td>{emp.review_count}</td>
                                    <td>{emp.avg_rating !== null ? emp.avg_rating.toFixed(2) : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </main>

            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <form
                        className="modal"
                        onSubmit={handleAddEmployee}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="modal__heading">Add Employee</h2>

                        <label className="field">
                            <span className="field__label">Name</span>
                            <input
                                className="field__input"
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                            />
                            {errors.name && <span className="field__error">{errors.name}</span>}
                        </label>

                        <label className="field">
                            <span className="field__label">Department</span>
                            <select
                                className="field__input"
                                name="department"
                                value={values.department}
                                onChange={handleChange}
                            >
                                <option value="">Select…</option>
                                {DEPARTMENTS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                            {errors.department && (
                                <span className="field__error">{errors.department}</span>
                            )}
                        </label>

                        <label className="field">
                            <span className="field__label">Email</span>
                            <input
                                className="field__input"
                                type="email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                            />
                            {errors.email && <span className="field__error">{errors.email}</span>}
                        </label>

                        <label className="field">
                            <span className="field__label">Joined on</span>
                            <input
                                className="field__input"
                                type="date"
                                name="joined_on"
                                value={values.joined_on}
                                onChange={handleChange}
                            />
                            {errors.joined_on && (
                                <span className="field__error">{errors.joined_on}</span>
                            )}
                        </label>

                        <div className="modal__actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button className="btn-primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Adding…' : 'Add Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default EmployeesPage;