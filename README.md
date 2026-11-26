# CareSlot: Clinic Scheduling and Reservation Platform

A full-stack web application for managing clinic appointments.

## Tech Stack
- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** NestJS + TypeORM
- **Database:** MySQL (managed via MySQL Workbench)
- **Auth:** JWT & Bcrypt

## How to Run
1. Open **MySQL Workbench**, connect to your local MySQL instance (`localhost:3306`), and create the database schema (e.g., `careslot_db`) or import the SQL file via **Server > Data Import**.
2. Configure your database credentials and JWT secret in `careslot-backend/.env`.
3. **Backend:** `cd careslot-backend && npm install && npm run start:dev`
4. **Frontend:** `cd careslot-frontend && npm install && npm run dev`