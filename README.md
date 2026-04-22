Feedback Collection App

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for collecting and managing user feedback with analytics dashboard.
- **Feedback Submission**: Users can submit feedback through a simple form
- **Feedback Management**: View all submitted feedback in a list
- **Analytics Dashboard**: Visualize feedback statistics with charts
- **RESTful API**: Backend API with proper validation and error handling
- **Responsive Design**: Mobile-friendly React frontend

 Tech Stack

 Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Express Validator** for input validation
- **CORS** for cross-origin requests
- **Helmet** for security headers
- **Morgan** for HTTP request logging
- **Dotenv** for environment variables

 Frontend
- **React.js** with React Router
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Recharts** for data visualization
- **Lucide React** for icons
- **React Scripts** for development

 Project Structure

```
feedback-app/
├── backend/                 # Express.js server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Main server file
│   └── README.md           # Backend documentation
├── frontend/               # React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── pages/          # React components (pages)
│   │   ├── services/       # API service functions
│   │   ├── App.js          # Main App component
│   │   └── index.js        # React entry point
│   └── package.json        # Frontend dependencies
├── doc_assets/             # Documentation assets
└── SCREENSHOT_MOCKUPS.md   # UI mockups
```

 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

 Installation & Setup

 Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/feedback-app
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

 Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

 API Endpoints

 Feedback Routes
- `GET /api/feedback` - Get all feedback
- `POST /api/feedback` - Submit new feedback
- `DELETE /api/feedback/:id` - Delete feedback by ID

 Statistics Routes
- `GET /api/stats` - Get feedback statistics

 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Submit feedback using the feedback form
3. View all feedback in the feedback list
4. Check analytics in the dashboard

 Development

 Running Tests
```bash
cd frontend
npm test
```

 Building for Production
```bash
cd frontend
npm run build
```

