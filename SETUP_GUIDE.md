# NUSmartQueue Setup Guide

## 🎯 For Teachers/Evaluators

This guide provides step-by-step instructions to run and test the NUSmartQueue application locally.

## ⚡ Quick Start (5 minutes)

### Step 1: Prerequisites Check
Ensure you have Node.js installed:
```bash
node --version
# Should show v16.0.0 or higher
```

If Node.js is not installed:
- Download from: https://nodejs.org/
- Install the LTS version
- Restart your terminal

### Step 2: Extract and Navigate
```bash
# Extract the project files
# Navigate to the project directory
cd NUSmartQueue
```

### Step 3: Install Dependencies
```bash
npm install
# This will take 1-2 minutes
```

### Step 4: Start the Application
```bash
npm run dev
```

### Step 5: Open in Browser
- Open your web browser
- Go to: `http://localhost:5173`
- The application should load immediately

## 🧪 Testing the Application

### Demo Accounts (Ready to Use)
- **Student Account**: demo.student@nus.edu.sg / DemoStudent123
- **Vendor Account**: demo.vendor@nus.edu.sg / DemoVendor123

### Test Scenarios

#### 1. Student Experience
1. Click "Student" on the home page
2. Click "Student Demo" button to auto-fill credentials
3. Click "Login"
4. Explore the dashboard:
   - View queue information for different stalls
   - Use filters (All Categories, Western, Asian, etc.)
   - Try different sorting options (Wait Time, Queue Length, Name)
   - Notice real-time queue status indicators

#### 2. Vendor Experience
1. Go back to home (or open new tab to `http://localhost:5173`)
2. Click "Vendor" 
3. Click "Vendor Demo" button to auto-fill credentials
4. Click "Login"
5. Test vendor features:
   - Update queue length using +/- buttons
   - Toggle stall status (Open/Closed)
   - Use quick actions (Clear Queue, +5 People, etc.)
   - Observe estimated wait time calculations

#### 3. Real-time Features
1. Open two browser windows/tabs
2. Login as Student in one, Vendor in the other
3. Update queue in Vendor dashboard
4. Watch changes reflect in Student dashboard (simulated real-time)

## 🔧 Troubleshooting

### Common Issues:

**"npm: command not found"**
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

**"Port 5173 already in use"**
- Close other applications using the port
- Or the app will automatically use a different port

**"Module not found" errors**
- Run `npm install` again
- Delete `node_modules` folder and run `npm install`

**Application won't load**
- Check that the terminal shows "Local: http://localhost:5173/"
- Try opening `http://127.0.0.1:5173/` instead

**Login doesn't work**
- Use the exact demo credentials provided
- Check for typos in email/password
- Try the auto-fill buttons

## 📋 Evaluation Checklist

### ✅ Core Features to Test:
- [ ] Application starts successfully
- [ ] Home page loads with role selection
- [ ] Student login works with demo credentials
- [ ] Student dashboard shows queue information
- [ ] Filtering and sorting functions work
- [ ] Vendor login works with demo credentials
- [ ] Vendor can update queue information
- [ ] Queue status toggles work
- [ ] Responsive design (try resizing browser)
- [ ] Navigation between pages works
- [ ] Logout functionality works

### ✅ Technical Requirements Addressed:
- [ ] **No complex setup required** - Simple npm commands
- [ ] **Provided credentials** - Demo accounts ready to use
- [ ] **Frontend/Backend separation** - React frontend + Firebase backend
- [ ] **Working authentication** - Login/logout functionality
- [ ] **Real-time features** - Queue updates and status changes

## 🎓 Architecture Overview

### Frontend (What you're running locally):
- **React Application**: Modern JavaScript framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Responsive styling
- **Vite**: Fast development server

### Backend (Cloud services):
- **Firebase Authentication**: User management
- **Firebase Firestore**: User profiles and data
- **Firebase Realtime Database**: Live queue updates

### Key Benefits of This Architecture:
1. **Separation of Concerns**: Frontend handles UI, backend handles data
2. **Scalability**: Firebase scales automatically
3. **Real-time Capabilities**: Live updates without page refresh
4. **Security**: Built-in authentication and access control
5. **Modern Standards**: Industry-standard architecture

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure Node.js version 16+ is installed
3. Try running `npm install` again
4. Restart the development server

The application is designed to work out-of-the-box with minimal setup required.

