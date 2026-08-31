import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout(): void {
        logout();
        navigate('/login');
    }

    return (
        <nav className="navbar">
            <div className="navbar__brand">
                <span className="navbar__mark">◆</span>
                <span>Employee Performance</span>
            </div>

            <div className="navbar__links">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                    }
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/employees"
                    className={({ isActive }) =>
                        `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                    }
                >
                    Employees
                </NavLink>
            </div>

            <div className="navbar__user">
                <span className="navbar__name">{user?.name}</span>
                <span className="navbar__role">{user?.role}</span>
                <button className="navbar__logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;