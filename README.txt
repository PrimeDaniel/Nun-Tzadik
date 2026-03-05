# Nun Tzadik - Map Pins & Attractions

A web application that allows users to save, manage, and share geographical pins for their favorite attractions or locations. Built with React, Vite, Firebase, and Leaflet.

## Features

- **Interactive Map:** Browse an interactive map and drop pins for locations or attractions.
- **User Authentication:** Secure sign-up and login securely handled by Firebase.
- **Personalized Pins:** Save your own private map locations.
- **Shareable Maps:** Generate a public link (e.g., `/map/:userId`) to share your map pins with others.
- **Modern UI:** Styled with Tailwind CSS, featuring animations from Framer Motion and modern icons.

## Tech Stack

- **Frontend:** React 19, React Router DOM, Vite
- **Mapping:** React Leaflet, Leaflet
- **Authentication/Storage:** Firebase
- **Styling:** Tailwind CSS, PostCSS, Framer Motion

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Firebase account with a configured web project (Authentication + Firestore)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PrimeDaniel/Nun-Tzadik.git
   cd nun-tzadik
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development and Deployment

The project uses ESLint for code quality and Tailwind for styling. Run `npm run lint` to catch potential issues before pushing. It can be easily deployed via Vercel out of the box (contains `vercel.json` config).
