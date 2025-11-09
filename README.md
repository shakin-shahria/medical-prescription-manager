# Prescription Management System

This is a Spring Boot + Angular application for managing prescriptions with authentication and reporting features.

Video Demo: [recording (3).webm](https://github.com/user-attachments/assets/69d3d7c9-f0b1-4296-8681-a07ea735ddfe)


## Features

- **User Authentication:** No anonymous access. Login required (SQLite database for credentials).  
- **Prescription List:** Displays prescriptions in a table with pagination and date range filter (default: current month).  
- **Create Prescription:** Authenticated users can add new prescriptions. Form validation ensures proper input.  
  - Prescription Date (mandatory)
  - Patient Name (mandatory)
  - Patient Age (mandatory, valid range)
  - Patient Gender (mandatory)
  - Diagnosis
  - Medicines
  - Next Visit Date (optional)
- **Edit Prescription:** Update existing prescriptions.  
- **Delete Prescription:** Requires confirmation via modal before deletion.  
- **Reports:** Day-wise prescription count chart (last 10 days) with dynamic updates based on selected date.  
- **REST API:**  
  - `GET /api/v1/prescriptions` returns JSON list  
  - All endpoints secured via authentication  
- **UI:** Sidebar navigation, responsive and clean design.  
- **Bonus:** Swagger API documentation included.

## How to Run

1. Start the Spring Boot backend:  
   ```bash
   ./mvnw spring-boot:run
2. Start the Angular frontend (after setup):
   ng serve




3. Access the application:


Backend API: http://localhost:8080


Frontend UI: http://localhost:4200




4. Login with default credentials:
   username: admin
   password: admin123



## Testing


Use VS Code REST Client or Postman to test CRUD endpoints:


GET, POST, PUT, DELETE /api/v1/prescriptions




SQLite database file prescription.db is created in the project root.


Verify users and prescriptions tables to confirm data persistence.


## Notes


The application includes form validation and proper error messages.


Sidebar navigation allows easy routing between pages.


Charts dynamically show the prescription count for the last 10 days.


The UI is responsive and visually appealing.


Swagger provides API documentation for developers.



Screen recording attached demonstrates all functionalities.


This is ready to **copy and paste directly** into your README.md.  

Do you want me to also make a **super short demo version** suitable for a 1-minute video?

