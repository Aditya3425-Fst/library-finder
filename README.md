# AI Library Finder

## 1. Problem Statement

Developers often spend significant time searching for suitable software libraries or frameworks for their projects. Comparing options involves manually gathering data from various sources like package managers (NPM), code repositories (GitHub), and documentation sites. This process is time-consuming, inefficient, and requires juggling multiple data points (downloads, stars, licenses, activity, etc.) to make an informed decision. Furthermore, getting relevant recommendations based on specific project needs (like functionality, tech stack, or scale) can be challenging.

## 2. Solution: AI Library Finder

AI Library Finder aims to streamline the process of discovering, comparing, and managing software libraries. It provides a centralized platform where developers can:

*   **Search:** Quickly search for libraries across package managers (initially NPM) using keywords or descriptions.
*   **Compare:** Select multiple libraries and view a side-by-side comparison of key metrics pulled from sources like NPM and GitHub (e.g., downloads, stars, forks, last updated date, license, score).
*   **Recommend:** Get library suggestions based on a free-form description of project requirements (e.g., "state management for react native app for large team").
*   **(Future) Manage:** Allow users to save, categorize, and manage lists of preferred libraries.

The application leverages external APIs for real-time data and employs a scoring mechanism to provide a quick assessment of a library's overall health and popularity.

## 3. Tech Stack

*   **Backend:**
    *   Runtime: Node.js
    *   Framework: Express.js
    *   Database: MongoDB (with Mongoose ODM)
    *   API Clients: Axios (for NPM/GitHub APIs)
    *   Scheduling: node-cron (for background score updates)
*   **Frontend (`simple-frontend`):**
    *   Library: React
    *   Build Tool: Vite
    *   Routing: react-router-dom
    *   API Client: Axios
    *   Styling: Plain CSS (initially, maybe component library later)
*   **Development:**
    *   Package Manager: npm
*   **Potential Future Additions:**
    *   Authentication: Passport.js or a service like Auth0/Firebase Auth
    *   Deployment: Vercel, Render, or AWS/GCP/Azure

## 4. Folder Structure

```
.
├── README.md
├── backend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── controllers/       # Request handlers (search, compare, recommend, library CRUD)
│   │   ├── jobs/              # Background jobs (e.g., updateScoresJob.js)
│   │   ├── models/            # Mongoose schemas (Library.js)
│   │   ├── routes/            # Express route definitions
│   │   ├── services/          # Business logic (npmService, githubService, scoringService, recommendationService)
│   │   └── utils/             # Utility functions (e.g., emailService - though OTP parts removed)
│   ├── .env                   # Environment variables (DB connection, API keys)
│   ├── package.json
│   ├── package-lock.json
│   └── server.js              # Main application entry point, server setup, middleware
├── simple-frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Static assets (images, fonts)
│   │   ├── components/        # Reusable React components (LibraryCard, Pagination, etc.)
│   │   ├── pages/             # Page-level components (SearchPage, RecommendPage, ComparePage)
│   │   ├── services/          # Frontend API interaction logic (libraryService.js)
│   │   ├── App.css            # Global application styles
│   │   ├── App.jsx            # Main application component, routing setup
│   │   ├── index.css          # Base CSS resets and styles
│   │   └── main.jsx           # Application entry point
│   ├── index.html             # Main HTML file
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js       # Vite configuration
```

*(Note: Some files/folders from the original `frontend` directory are omitted as the focus shifted to `simple-frontend`)*

## 5. Setup and Running

**Prerequisites:**

*   Node.js and npm installed
*   MongoDB instance running (local or cloud like MongoDB Atlas)
*   A GitHub Personal Access Token (PAT) with `public_repo` scope.

**Backend Setup:**

1.  Navigate to the `backend` directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file in the `backend` directory and add the following variables:
    ```dotenv
    MONGO_URI=your_mongodb_connection_string
    PORT=5000 # Or any port you prefer
    GITHUB_PAT=your_github_personal_access_token
    FRONTEND_URL=http://localhost:5173 # Or the port your frontend runs on (for CORS)
    ```
4.  *(Optional but Recommended)* Seed the database with initial library data (if needed for features relying on local data): `node seed.js`
5.  Start the backend server: `npm run dev` (or `nodemon server.js` if you have nodemon installed for development)

**Frontend Setup (`simple-frontend`):**

1.  Navigate to the `simple-frontend` directory: `cd ../simple-frontend` (from backend) or `cd simple-frontend` (from root)
2.  Install dependencies: `npm install`
3.  Start the development server: `npm run dev`
4.  Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

The application should now be running, with the frontend communicating with the backend API. 