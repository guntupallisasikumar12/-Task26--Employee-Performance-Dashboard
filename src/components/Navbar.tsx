import {
    Link,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/useAuth";


export default function Navbar() {

    const {
        user,
        logout,
    } = useAuth();

    const navigate = useNavigate();


    const handleLogout = () => {

        logout();

        navigate("/login");
    };


    return (
        <nav className="navbar">

            <h2>
                Employee Performance
            </h2>

            <div>

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/employees">
                    Employees
                </Link>

                <span>
                    {user?.name}
                    {" "}
                    ({user?.role})
                </span>

                <button
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}
