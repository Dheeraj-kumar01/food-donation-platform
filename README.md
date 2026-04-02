# Food Donation Platform

A full-stack MERN application that connects **food donors** with **people in need**, helping reduce food waste and support communities.


## Features

- User Authentication (Donor / Receiver)
- Location-based food listings
- Add & manage food donations
- Real-time availability tracking
- Map integration for nearby food
- Dashboard for activity tracking

## Tech Stack

Frontend:
- React.js
- Tailwind CSS / CSS
- Axios

Backend:
- Node.js
- Express.js
- MongoDB

Other:
- JWT Authentication
- Cloudinary (for images)
- Map API (for location)


## Project Structure

root/
│
├── food-donation-frontend/
│ ├── src/
│ ├── public/
│ └── screenshots/
│
├── food-donation-backend/
│ ├── routes/
│ ├── models/
│ └── controllers/
│
└── README.md


Sceenshorts


### Chat Page
![Chat Page](food-donation-frontend/screenshorts/chat.png)

### Claims-page
![Dashboard](food-donation-frontend/screenshorts/claims-page.png)

### Donor Dashboard
![Map](food-donation-frontend/screenshorts/donor-dashboard.png)

### Landing page
![Add Food](food-donation-frontend/screenshorts/landing-page.png)

### Map page
![Listings](food-donation-frontend/screenshorts/map-page.png)

### reciver Dashboard
![Login](food-donation-frontend/screenshorts/reciver-dashboard.png)


## ⚙️ Installation

### 1️Clone the repository
```bash
git clone https://github.com/Dheeraj-kumar01/food-donation-platform.git
cd food-donation-platform

2️⃣ Install dependencies
Backend
cd food-donation-backend
npm install
Frontend
cd ../food-donation-frontend
npm install
▶️ Run the project
Backend
cd food-donation-backend
npm start
Frontend
cd food-donation-frontend
npm run dev

 Environment Variables

Create a .env file in backend:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_URL=your_cloudinary_url

 Contribution

Feel free to fork this repo and contribute!

Author

Dheeraj Kumar

GitHub: https://github.com/Dheeraj-kumar01
