# 🎓 Full-Stack Student Management System

Welcome to the full-stack Student Management System! This project incorporates a **Vanilla HTML/CSS/JS frontend**, a **Spring Boot REST API backend**, and a **MySQL Database**. 

## 🏗️ Project Structure
```text
student-management-system/
├── backend/                  # Java Spring Boot application
│   ├── pom.xml               # Maven dependencies
│   └── src/main/java/com/sms/...
│       ├── controller/       # API Definitions (REST Endpoints)
│       ├── exception/        # Global error handling logic
│       ├── model/            # Student Entity
│       ├── repository/       # Data Access/JPA Layer
│       └── service/          # Business Logic
│   └── src/main/resources/
│       └── application.properties # Server and Database settings
├── database/                 
│   └── schema.sql            # Table initialization scripts
└── frontend/                 # Static web application
    ├── index.html            # Main markup UI
    ├── style.css             # Glassmorphism/Modern aesthetic
    └── app.js                # Fetch APIs linking to backend
```

---

## 🚀 1. Setup Instructions

### Step 1: Database Setup
1. Download and install **MySQL Server**.
2. Open your MySQL client (like MySQL Workbench).
3. Open and run the `database/schema.sql` script to create the `student_db` database and `students` table. 

### Step 2: Backend Setup (Spring Boot)
1. Ensure you have **Java 17** (or above) and **Maven** installed.
2. If your MySQL credentials are not `root`/`root`, update `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=YOUR_USERNAME
   spring.datasource.password=YOUR_PASSWORD
   ```
3. Open a terminal in the `backend/` folder.
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   *The server will start on `http://localhost:8080`.*

### Step 3: Frontend Setup
1. The frontend uses pure HTML/JS and requires no complex npm installations! 
2. Simply double-click `frontend/index.html` to open it in your browser. (Alternatively, run a simple local server using VSCode Live Server extension).
3. The UI will instantly communicate with `http://localhost:8080/api/v1/students`.

---

## 🧪 2. How to Test APIs (Using Postman)

You can test the Spring Boot API independently without the frontend using Postman:

1. **Add a Student (POST)**
   * **URL:** `POST http://localhost:8080/api/v1/students`
   * **Body Type:** `raw` -> `JSON`
   * **Payload:**
     ```json
     {
       "name": "Jane Taylor",
       "email": "jane@example.com"
     }
     ```
   * **Expected Response:** `201 Created` with the registered JSON.

2. **Retrieve all Students (GET)**
   * **URL:** `GET http://localhost:8080/api/v1/students`
   * **Expected Response:** `200 OK` + Array of JSON student objects.

3. **Update a Student (PUT)**
   * **URL:** `PUT http://localhost:8080/api/v1/students/1` (Assuming ID is 1)
   * **Body Type:** `raw` -> `JSON`
   * **Payload:**
     ```json
     {
       "name": "Jane Doe Updated",
       "email": "jane.update@example.com"
     }
     ```
   * **Expected Response:** `200 OK`

4. **Delete a Student (DELETE)**
   * **URL:** `DELETE http://localhost:8080/api/v1/students/1`
   * **Expected Response:** `200 OK` with JSON `{"deleted": true}`

---

## 🔌 3. How the Integration Works

The frontend links to the backend using the **JavaScript Fetch API**. Note how `app.js` is structured:
* **The Asynchronous Call**: We use `async/await` syntax to keep the UI smooth without blocking execution. 
* **JSON Mapping**: `body: JSON.stringify(studentData)` converts our JavaScript object into format Spring Boot expects (`@RequestBody`).
* **CORS**: In the Spring Boot `StudentController`, we included `@CrossOrigin(origins = "*")`. Browsers typically block requests made from port `5500` (live server) or file system (`file://`) to `8080` (Spring Boot server). This annotation removes that barrier.

## ⚠️ Common Mistakes to Avoid & Troubleshooting
* **Error:** *Network Error* or *Failed to Fetch* in UI.
  * *Fix:* Your Spring Boot app isn't active. Keep your spring boot terminal running before opening `index.html`.
* **Error:** *CORS policy block in Chrome Console.*
  * *Fix:* Verify that `@CrossOrigin` remains at the top of your `StudentController`.
* **Error:** *Access denied for user 'root'@'localhost'* in Java backend logs.
  * *Fix:* Your database credentials in `application.properties` are incorrect or MySQL server is down.
