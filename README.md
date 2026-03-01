# Job Tracker

Job Tracker is a web application designed to help users manage and track their job applications in a structured way.

The project was built to simulate a real-world product workflow, including authentication, data persistence, state management, and deployment.

## Live Demo

https://TU-URL-DE-VERCEL.vercel.app

## Features

- User authentication with Firebase
- Create, update and delete job applications
- Status tracking (Applied, Interview, Offer, Rejected)
- Filtering by application status
- Dashboard overview with basic metrics
- Persistent storage using Firestore

## Tech Stack

Frontend:
- React 19
- Vite
- React Router

Backend / Services:
- Firebase Authentication
- Firebase Firestore

Deployment:
- Vercel

## Local Setup

Clone the repository:

```bash
git clone https://github.com/NahuelBueno/job-tracker.git
cd job-tracker
npm install
npm run dev
```

Create a `.env` file with the following variables:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Project Goal

The goal of this project was to practice:

- Building a full CRUD application
- Working with protected routes
- Managing cloud-based data
- Handling deployment workflows
- Structuring a small production-ready React application

## Author

Nahuel Bueno