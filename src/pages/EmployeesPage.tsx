import {
    useEffect,
    useState,
} from "react";

import type {
    ChangeEvent,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import api from "../api/axios";

import type {
    Employee,
} from "../types";

import useDebounce from
    "../hooks/useDebounce";

import { useAuth } from
    "../context/useAuth";

import Navbar from
    "../components/Navbar";


export default function EmployeesPage() {

    const [employees, setEmployees] =
        useState<Employee[]>([]);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const debouncedSearch =
        useDebounce(search, 300);

    const navigate = useNavigate();

    const { user } = useAuth();


    useEffect(() => {

        const fetchEmployees =
            async () => {

                setLoading(true);

                try {

                    const response =
                        await api.get(
                            "/employees",
                            {
                                params: {
                                    search:
                                        debouncedSearch,
                                },
                            }
                        );

                    setEmployees(
                        response.data
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                } finally {

                    setLoading(false);
                }
            };


        fetchEmployees();

    }, [debouncedSearch]);


    const handleSearch = (
        event: ChangeEvent<HTMLInputElement>
    ) => {

        setSearch(
            event.target.value
        );
    };


    return (

        <>
            <Navbar />

            <main className="container">

                <div className="page-header">

                    <h1>
                        Employees
                    </h1>

                    {user?.role === "admin" && (

                        <button>
                            Add Employee
                        </button>

                    )}

                </div>


                <input
                    type="text"
                    placeholder="Search employee..."
                    value={search}
                    onChange={handleSearch}
                />


                {loading && (
                    <p>
                        Loading...
                    </p>
                )}


                <table>

                    <thead>

                        <tr>

                            <th>Name</th>

                            <th>Department</th>

                            <th>Email</th>

                            <th>Reviews</th>

                            <th>Average Rating</th>

                        </tr>

                    </thead>


                    <tbody>

                        {employees.map(
                            (employee) => (

                                <tr
                                    key={
                                        employee.id
                                    }
                                    onClick={() =>
                                        navigate(
                                            `/employees/${employee.id}`
                                        )
                                    }
                                >

                                    <td>
                                        {employee.name}
                                    </td>

                                    <td>
                                        {
                                            employee.department
                                        }
                                    </td>

                                    <td>
                                        {employee.email}
                                    </td>

                                    <td>
                                        {
                                            employee.review_count
                                        }
                                    </td>

                                    <td>
                                        {
                                            employee.average_rating ??
                                            "N/A"
                                        }
                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </main>
        </>
    );
}
