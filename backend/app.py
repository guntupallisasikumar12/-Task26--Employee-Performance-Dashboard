from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    get_jwt,
    jwt_required
)
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import timedelta


app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "change-this-to-a-secret-key"

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
    minutes=30
)

app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(
    days=7
)


CORS(
    app,
    origins=["http://localhost:5173"],
    allow_headers=["Content-Type", "Authorization"]
)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)


DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Sasi@418",
    "database": "emp_performance"
}


def get_db():
    return mysql.connector.connect(**DB_CONFIG)


def execute_query(query, params=None, fetchone=False):
    conn = None
    cursor = None

    try:
        conn = get_db()

        cursor = conn.cursor(dictionary=True)

        cursor.execute(query, params or ())

        if query.strip().upper().startswith("SELECT"):
            if fetchone:
                result = cursor.fetchone()
            else:
                result = cursor.fetchall()
        else:
            conn.commit()
            result = cursor.lastrowid

        return result, None

    except Error as error:

        if conn:
            conn.rollback()

        return None, str(error)

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "message": "Endpoint not found"
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "message": "Method not allowed"
    }), 405


@app.errorhandler(Exception)
def handle_exception(error):

    print("Server Error:", error)

    return jsonify({
        "message": "Something went wrong. Please try again."
    }), 400


# ==================================================
# AUTH
# ==================================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json() or {}

    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    query = """
        SELECT id, name, email, password, role
        FROM users
        WHERE email = %s
    """

    user, error = execute_query(
        query,
        (email,),
        fetchone=True
    )

    if error:
        return jsonify({
            "message": "Unable to process login"
        }), 400

    if not user:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    if not bcrypt.check_password_hash(
        user["password"],
        password
    ):
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    claims = {
        "name": user["name"],
        "role": user["role"]
    }

    access_token = create_access_token(
        identity=str(user["id"]),
        additional_claims=claims
    )

    refresh_token = create_refresh_token(
        identity=str(user["id"]),
        additional_claims=claims
    )

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200


@app.route("/api/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():

    identity = get_jwt_identity()

    claims = get_jwt()

    additional_claims = {
        "name": claims.get("name"),
        "role": claims.get("role")
    }

    access_token = create_access_token(
        identity=identity,
        additional_claims=additional_claims
    )

    return jsonify({
        "access_token": access_token
    }), 200


@app.route("/api/me", methods=["GET"])
@jwt_required()
def get_me():

    user_id = get_jwt_identity()

    query = """
        SELECT id, name, email, role
        FROM users
        WHERE id = %s
    """

    user, error = execute_query(
        query,
        (user_id,),
        fetchone=True
    )

    if error or not user:
        return jsonify({
            "message": "User not found"
        }), 404

    return jsonify(user), 200


# ==================================================
# ROLE CHECK
# ==================================================

def admin_required():

    claims = get_jwt()

    return claims.get("role") == "admin"


# ==================================================
# EMPLOYEES
# ==================================================

@app.route("/api/employees", methods=["GET"])
@jwt_required()
def get_employees():

    department = request.args.get("department", "").strip()

    search = request.args.get("search", "").strip()

    query = """
        SELECT
            e.id,
            e.name,
            e.department,
            e.email,
            e.joined_on,

            COUNT(r.id) AS review_count,

            ROUND(
                AVG(
                    CASE
                        WHEN r.rating = 'Excellent' THEN 4
                        WHEN r.rating = 'Good' THEN 3
                        WHEN r.rating = 'Average' THEN 2
                        WHEN r.rating = 'Poor' THEN 1
                    END
                ),
                2
            ) AS average_rating

        FROM employees e

        LEFT JOIN performance_reviews r
        ON e.id = r.employee_id

        WHERE 1=1
    """

    params = []

    if department:

        query += " AND e.department = %s"

        params.append(department)

    if search:

        query += """
            AND (
                e.name LIKE %s
                OR e.email LIKE %s
            )
        """

        search_value = f"%{search}%"

        params.extend([
            search_value,
            search_value
        ])

    query += """
        GROUP BY
            e.id,
            e.name,
            e.department,
            e.email,
            e.joined_on

        ORDER BY e.name
    """

    employees, error = execute_query(
        query,
        tuple(params)
    )

    if error:
        return jsonify({
            "message": "Unable to fetch employees"
        }), 400

    return jsonify(employees), 200


@app.route("/api/employees", methods=["POST"])
@jwt_required()
def add_employee():

    if not admin_required():

        return jsonify({
            "message": "Admin access required"
        }), 403

    data = request.get_json() or {}

    name = data.get("name", "").strip()

    department = data.get("department", "").strip()

    email = data.get("email", "").strip()

    joined_on = data.get("joined_on", "")

    allowed_departments = [
        "Engineering",
        "Sales",
        "HR",
        "Marketing",
        "Finance"
    ]

    if not all([
        name,
        department,
        email,
        joined_on
    ]):

        return jsonify({
            "message": "All fields are required"
        }), 400

    if department not in allowed_departments:

        return jsonify({
            "message": "Invalid department"
        }), 400

    check_query = """
        SELECT id
        FROM employees
        WHERE email = %s
    """

    existing, error = execute_query(
        check_query,
        (email,),
        fetchone=True
    )

    if error:
        return jsonify({
            "message": "Unable to validate employee"
        }), 400

    if existing:

        return jsonify({
            "message": "Email already exists"
        }), 409

    query = """
        INSERT INTO employees
        (
            name,
            department,
            email,
            joined_on
        )
        VALUES (%s, %s, %s, %s)
    """

    employee_id, error = execute_query(
        query,
        (
            name,
            department,
            email,
            joined_on
        )
    )

    if error:
        return jsonify({
            "message": "Unable to add employee"
        }), 400

    return jsonify({
        "message": "Employee added successfully",
        "id": employee_id
    }), 201


@app.route("/api/employees/<int:employee_id>", methods=["GET"])
@jwt_required()
def get_employee(employee_id):

    employee_query = """
        SELECT
            id,
            name,
            department,
            email,
            joined_on
        FROM employees
        WHERE id = %s
    """

    employee, error = execute_query(
        employee_query,
        (employee_id,),
        fetchone=True
    )

    if error:
        return jsonify({
            "message": "Unable to fetch employee"
        }), 400

    if not employee:

        return jsonify({
            "message": "Employee not found"
        }), 404

    reviews_query = """
        SELECT
            r.id,
            r.rating,
            r.review_notes,
            r.review_date,

            u.name AS reviewer_name

        FROM performance_reviews r

        JOIN users u
        ON r.reviewer_id = u.id

        WHERE r.employee_id = %s

        ORDER BY r.review_date DESC
    """

    reviews, error = execute_query(
        reviews_query,
        (employee_id,)
    )

    if error:
        return jsonify({
            "message": "Unable to fetch reviews"
        }), 400

    return jsonify({
        "employee": employee,
        "reviews": reviews
    }), 200


# ==================================================
# REVIEWS
# ==================================================

@app.route("/api/reviews", methods=["POST"])
@jwt_required()
def add_review():

    data = request.get_json() or {}

    employee_id = data.get("employee_id")

    rating = data.get("rating")

    review_notes = data.get("review_notes", "").strip()

    review_date = data.get("review_date")

    allowed_ratings = [
        "Excellent",
        "Good",
        "Average",
        "Poor"
    ]

    if not all([
        employee_id,
        rating,
        review_date
    ]):

        return jsonify({
            "message": "Employee, rating and review date are required"
        }), 400

    if rating not in allowed_ratings:

        return jsonify({
            "message": "Invalid rating"
        }), 400

    reviewer_id = get_jwt_identity()

    employee_query = """
        SELECT id
        FROM employees
        WHERE id = %s
    """

    employee, error = execute_query(
        employee_query,
        (employee_id,),
        fetchone=True
    )

    if error or not employee:

        return jsonify({
            "message": "Employee not found"
        }), 404

    query = """
        INSERT INTO performance_reviews
        (
            employee_id,
            reviewer_id,
            rating,
            review_notes,
            review_date
        )
        VALUES (%s, %s, %s, %s, %s)
    """

    review_id, error = execute_query(
        query,
        (
            employee_id,
            reviewer_id,
            rating,
            review_notes,
            review_date
        )
    )

    if error:

        return jsonify({
            "message": "Unable to add review"
        }), 400

    return jsonify({
        "message": "Review added successfully",
        "id": review_id
    }), 201


@app.route("/api/reviews/<int:review_id>", methods=["DELETE"])
@jwt_required()
def delete_review(review_id):

    if not admin_required():

        return jsonify({
            "message": "Admin access required"
        }), 403

    check_query = """
        SELECT id
        FROM performance_reviews
        WHERE id = %s
    """

    review, error = execute_query(
        check_query,
        (review_id,),
        fetchone=True
    )

    if error or not review:

        return jsonify({
            "message": "Review not found"
        }), 404

    query = """
        DELETE FROM performance_reviews
        WHERE id = %s
    """

    _, error = execute_query(
        query,
        (review_id,)
    )

    if error:

        return jsonify({
            "message": "Unable to delete review"
        }), 400

    return jsonify({
        "message": "Review deleted successfully"
    }), 200


# ==================================================
# ANALYTICS - KPIs
# ==================================================

@app.route("/api/analytics/kpis", methods=["GET"])
@jwt_required()
def analytics_kpis():

    total_employees, error = execute_query(
        "SELECT COUNT(*) AS total FROM employees",
        fetchone=True
    )

    if error:
        return jsonify({
            "message": "Unable to fetch analytics"
        }), 400

    total_reviews, error = execute_query(
        "SELECT COUNT(*) AS total FROM performance_reviews",
        fetchone=True
    )

    if error:
        return jsonify({
            "message": "Unable to fetch analytics"
        }), 400

    average_score_query = """
        SELECT
            ROUND(
                AVG(
                    CASE
                        WHEN rating = 'Excellent' THEN 4
                        WHEN rating = 'Good' THEN 3
                        WHEN rating = 'Average' THEN 2
                        WHEN rating = 'Poor' THEN 1
                    END
                ),
                2
            ) AS average_rating
        FROM performance_reviews
    """

    average_score, error = execute_query(
        average_score_query,
        fetchone=True
    )

    if error:
        return jsonify({
            "message": "Unable to fetch analytics"
        }), 400

    top_performer_query = """
        SELECT
            e.name,
            COUNT(r.id) AS excellent_count

        FROM performance_reviews r

        JOIN employees e
        ON r.employee_id = e.id

        WHERE r.rating = 'Excellent'

        GROUP BY e.id, e.name

        ORDER BY excellent_count DESC

        LIMIT 1
    """

    top_performer, error = execute_query(
        top_performer_query,
        fetchone=True
    )

    if error:
        return jsonify({
            "message": "Unable to fetch analytics"
        }), 400

    return jsonify({
        "total_employees": total_employees["total"],
        "total_reviews": total_reviews["total"],
        "average_rating": (
            average_score["average_rating"] or 0
        ),
        "top_performer": (
            top_performer["name"]
            if top_performer
            else "No data"
        )
    }), 200


# ==================================================
# ANALYTICS - BY DEPARTMENT
# ==================================================

@app.route(
    "/api/analytics/by-department",
    methods=["GET"]
)
@jwt_required()
def analytics_by_department():

    query = """
        SELECT
            e.department,

            COUNT(r.id) AS total_reviews,

            ROUND(
                SUM(
                    CASE
                        WHEN r.rating = 'Excellent' THEN 4
                        WHEN r.rating = 'Good' THEN 3
                        WHEN r.rating = 'Average' THEN 2
                        ELSE 1
                    END
                ) * 1.0 / COUNT(r.id),
                2
            ) AS avg_score

        FROM performance_reviews r

        JOIN employees e
        ON r.employee_id = e.id

        GROUP BY e.department

        ORDER BY e.department
    """

    data, error = execute_query(query)

    if error:

        return jsonify({
            "message": "Unable to fetch department analytics"
        }), 400

    return jsonify(data), 200


# ==================================================
# ANALYTICS - RATING DISTRIBUTION
# ==================================================

@app.route(
    "/api/analytics/rating-distribution",
    methods=["GET"]
)
@jwt_required()
def rating_distribution():

    query = """
        SELECT
            rating,
            COUNT(*) AS count

        FROM performance_reviews

        GROUP BY rating
    """

    data, error = execute_query(query)

    if error:

        return jsonify({
            "message": "Unable to fetch rating distribution"
        }), 400

    return jsonify(data), 200


# ==================================================
# ANALYTICS - REVIEW TREND
# ==================================================

@app.route(
    "/api/analytics/trend",
    methods=["GET"]
)
@jwt_required()
def analytics_trend():

    query = """
        SELECT
            DATE_FORMAT(
                review_date,
                '%b %Y'
            ) AS month,

            COUNT(*) AS total

        FROM performance_reviews

        WHERE review_date >=
            DATE_SUB(CURDATE(), INTERVAL 6 MONTH)

        GROUP BY
            YEAR(review_date),
            MONTH(review_date)

        ORDER BY
            YEAR(review_date),
            MONTH(review_date)
    """

    data, error = execute_query(query)

    if error:

        return jsonify({
            "message": "Unable to fetch review trend"
        }), 400

    return jsonify(data), 200


if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )
