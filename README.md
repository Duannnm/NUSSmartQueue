# NUSmartQueue - Smart Queue Management for NUS

A real-time queue management system for NUS canteens that helps students avoid long queues and enables vendors to manage their stall status efficiently.

## Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourUsername/NUSmartQueue.git
   cd NUSmartQueue
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The application will be ready to use!

### Demo Accounts (for testing)
- **Student**: demo.student@nus.edu.sg / DemoStudent123
- **Vendor**: demo.vendor@nus.edu.sg / DemoVendor123

## Key Features

### For Students
- **Real-time Queue Viewing**: See current queue lengths and estimated wait times
- **Smart Filtering**: Filter by food category, location, or preferences  
- **Intelligent Sorting**: Sort by wait time, queue length, or stall name
- **Mobile Responsive**: Works perfectly on phones and tablets

### For Vendors
- **Easy Queue Updates**: Simple +/- buttons to update queue length
- **Stall Status Control**: Toggle open/closed status instantly
- **Real-time Sync**: Updates appear immediately on student dashboards
- **Quick Actions**: Bulk queue adjustments and reset options

## Architecture

### Frontend/Backend Separation
- **Frontend**: React application with TypeScript
- **Backend**: Firebase services for authentication and real-time data
  - Firebase Authentication for user management
  - Firebase Firestore for user profiles and static data
  - Firebase Realtime Database for live queue updates

This follows modern industry standards where Firebase serves as a complete backend-as-a-service solution.

## Technical Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore + Realtime Database)
- **Build Tool**: Vite
- **UI Components**: Custom components with Tailwind CSS
- **Real-time Updates**: Firebase Realtime Database with WebSocket connections

## Application Flow

### Student Experience:
1. **Login** with student credentials
2. **View Dashboard** showing all available stalls
3. **Filter & Sort** stalls by preferences
4. **Check Queue Status** with real-time updates
5. **Make Informed Decisions** about where to eat

### Vendor Experience:
1. **Login** with vendor credentials
2. **Access Vendor Dashboard** for stall management
3. **Update Queue Length** using simple controls
4. **Toggle Stall Status** (open/closed)
5. **Monitor Real-time Updates** reflected to students

##  Project Goals

NUSmartQueue addresses the common problem of unpredictable queue lengths at NUS canteens by:

1. **Reducing Wait Times**: Students can choose less crowded stalls
2. **Improving Efficiency**: Vendors can manage customer flow better
3. **Enhancing Experience**: Real-time information leads to better dining decisions
4. **Supporting Campus Life**: Helps students optimize their meal timing

##  Security & Privacy

- Secure authentication with Firebase Auth
- Role-based access control (students vs vendors)
- Data validation and sanitization
- Privacy-compliant user data handling

##  Future Enhancements

- **Predictive Analytics**: ML models to predict queue patterns
- **Push Notifications**: Real-time alerts for queue changes
- **Location Integration**: GPS-based recommendations
- **Advanced Analytics**: Vendor insights and business intelligence
- **Social Features**: Reviews and ratings system

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Authentication
│   ├── SignUp.tsx      # User registration
│   ├── StudentDashboard.tsx  # Student interface
│   └── VendorDashboard.tsx   # Vendor interface
├── firebase.ts         # Firebase configuration
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Firebase Configuration
The application includes pre-configured Firebase settings for development and testing. For production deployment, update the Firebase configuration in `src/firebase.ts` with your own Firebase project credentials.

## Contributing

This project was developed as part of NUS Orbital 2025. For questions or contributions, please contact the development team.


**Note**: This application includes demo data and configurations for educational and testing purposes. The Firebase configuration is set up for development use.

