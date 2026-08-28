import mysql.connector
from flask_bcrypt import Bcrypt
from datetime import date, timedelta
import random

bcrypt = Bcrypt()

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Sasi@418",
    database="emp_performance"
)

cursor = db.cursor()

# Clear old data
cursor.execute("DELETE FROM performance_reviews")
cursor.execute("DELETE FROM employees")
cursor.execute("DELETE FROM users")

db.commit()


# -------------------------
# USERS
# -------------------------

users = [
    (
        "Admin User",
        "admin@example.com",
        bcrypt.generate_password_hash("admin123").decode("utf-8"),
        "admin"
    ),
    (
        "Manager User",
        "manager@example.com",
        bcrypt.generate_password_hash("manager123").decode("utf-8"),
        "manager"
    )
]

cursor.executemany(
    """
    INSERT INTO users (name, email, password, role)
    VALUES (%s, %s, %s, %s)
    """,
    users
)


# -------------------------
# EMPLOYEES
# -------------------------

employees = [
    ("Arjun Kumar", "Engineering", "arjun@example.com", "2024-01-15"),
    ("Priya Sharma", "Engineering", "priya@example.com", "2024-02-20"),
    ("Rahul Reddy", "Engineering", "rahul@example.com", "2024-03-10"),
    ("Anjali Devi", "Engineering", "anjali@example.com", "2024-04-12"),

    ("Kiran Kumar", "Sales", "kiran@example.com", "2024-01-10"),
    ("Sneha Rao", "Sales", "sneha@example.com", "2024-02-18"),
    ("Vijay Kumar", "Sales", "vijay@example.com", "2024-05-05"),
    ("Divya Rani", "Sales", "divya@example.com", "2024-06-20"),

    ("Ramesh Babu", "HR", "ramesh@example.com", "2023-11-12"),
    ("Lakshmi Devi", "HR", "lakshmi@example.com", "2024-01-25"),
    ("Suresh Kumar", "HR", "suresh@example.com", "2024-03-15"),
    ("Keerthi Reddy", "HR", "keerthi@example.com", "2024-04-10"),

    ("Naveen Kumar", "Marketing", "naveen@example.com", "2024-02-01"),
    ("Pooja Sharma", "Marketing", "pooja@example.com", "2024-03-01"),
    ("Manoj Kumar", "Marketing", "manoj@example.com", "2024-05-12"),
    ("Swathi Reddy", "Marketing", "swathi@example.com", "2024-06-01"),

    ("Ravi Teja", "Finance", "ravi@example.com", "2024-01-18"),
    ("Bhavani Devi", "Finance", "bhavani@example.com", "2024-02-28"),
    ("Srinivas Rao", "Finance", "srinivas@example.com", "2024-04-08"),
    ("Deepika Rani", "Finance", "deepika@example.com", "2024-05-18")
]

cursor.executemany(
    """
    INSERT INTO employees (name, department, email, joined_on)
    VALUES (%s, %s, %s, %s)
    """,
    employees
)

db.commit()


# -------------------------
# PERFORMANCE REVIEWS
# -------------------------

ratings = ["Excellent", "Good", "Average", "Poor"]

notes = [
    "Excellent performance and teamwork.",
    "Good contribution to the team.",
    "Needs improvement in communication.",
    "Completed assigned tasks successfully.",
    "Strong technical and problem-solving skills.",
    "Should improve consistency.",
    "Performed well during this review period."
]

reviews = []

today = date.today()

for _ in range(60):
    employee_id = random.randint(1, 20)
    reviewer_id = random.choice([1, 2])

    review_date = today - timedelta(
        days=random.randint(0, 180)
    )

    rating = random.choice(ratings)
    review_note = random.choice(notes)

    reviews.append(
        (
            employee_id,
            reviewer_id,
            rating,
            review_note,
            review_date
        )
    )

cursor.executemany(
    """
    INSERT INTO performance_reviews
    (employee_id, reviewer_id, rating, review_notes, review_date)
    VALUES (%s, %s, %s, %s, %s)
    """,
    reviews
)

db.commit()

print("Seed completed successfully!")
print("Users inserted: 2")
print("Employees inserted: 20")
print("Reviews inserted: 60")

cursor.close()
db.close()
