-- Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS student_db;

-- Select the newly created database
USE student_db;

-- Creating the students table
-- Note: If running through Spring Boot with spring.jpa.hibernate.ddl-auto=update, 
-- Spring Boot will create this automatically. However, manually providing this script 
-- follows best practices.
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Optional: Insert some dummy data for testing purposes
INSERT INTO students (name, email) VALUES ('John Doe', 'john.doe@example.com');
INSERT INTO students (name, email) VALUES ('Jane Smith', 'jane.smith@example.com');
