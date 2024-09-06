# Admin Dashboard

This project is an Admin Dashboard built with React, TypeScript, and Vite. It includes features for image management, prompt data handling, and image generation for the mythelix app.

## Prerequisites

- Node.js (v18 or later)
- npm (v7 or later)
- Docker (optional, for containerized deployment)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```bash
   VITE_ADMIN_PASSWORD=your_admin_password
   VITE_TEST_PASSWORD=your_test_password
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` (or the port specified by Vite).

## Authentication

The app uses a simple authentication system. Users are defined in `AuthService.ts` and passwords are stored as environment variables.

## API Configuration

The app communicates with a backend server. The server URL is configured in `server.tsx`. Make sure to update this URL to match your backend server address.

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Docker Deployment

This project includes a Dockerfile for containerized deployment. The Dockerfile uses a multi-stage build process to create a smaller, production-ready image.

1. Build the Docker image:

   ```
   docker build -t admin-dashboard .
   ```

2. Run the container:

   ```
   docker run -p 8080:8080 admin-dashboard
   ```

   The app will be available at `http://localhost:8080`.



