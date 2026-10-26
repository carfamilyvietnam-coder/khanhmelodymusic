# KhanhMelody Admin Panel

Admin panel for KhanhMelody music platform - a React-based dashboard for managing songs, users, revenue, and wallets.

## Features

- **Dashboard**: Overview with statistics and interactive charts (Revenue trend, Top songs performance)
- **Song Management**: Upload, edit, delete songs with search, filter by genre, and pagination
- **User Management**: View, activate/deactivate, delete users with pagination
- **Revenue Management**: Track total revenue and view transaction history
- **Wallet Management**: Monitor user wallet balances and status
- **Authentication**: Secure login with JWT token
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Visual feedback during API calls
- **Responsive Design**: Dark theme with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Configuration

### API Base URL

The API base URL is configured in `src/App.jsx`:
```javascript
const API_BASE = 'http://localhost:5000/api'
```

Update this to match your backend API endpoint.

## API Endpoints

The admin panel expects the following API endpoints:

- `POST /api/login` - Admin authentication
- `GET /api/admin/songs` - Get all songs
- `POST /api/admin/songs` - Upload new song
- `PUT /api/admin/songs/:id` - Update song
- `DELETE /api/admin/songs/:id` - Delete song
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/revenue` - Get revenue data
- `GET /api/admin/wallets` - Get wallet data

## Features Detail

### Dashboard
- Total songs count
- Total users count
- Total revenue
- Revenue trend line chart (monthly)
- Top songs performance bar chart (plays vs downloads)

### Song Management
- Upload songs with file upload
- Edit song details (title, artist, album, genre, price)
- Delete songs with confirmation
- Search by title or artist
- Filter by genre (Pop, Rock, Hip Hop, Electronic, Ballad)
- Pagination (10 items per page)

### User Management
- View user list with details
- Activate/deactivate users
- Delete users with confirmation
- Pagination (10 items per page)

### Revenue Management
- Total revenue display
- Transaction count
- Transaction history table

### Wallet Management
- View all user wallets
- Check wallet balances
- View wallet status (Active/Inactive)

## Authentication

The admin panel uses JWT token-based authentication:
- Login credentials are sent to `/api/login`
- Token is stored in localStorage
- Token is included in Authorization header for all API requests
- Logout clears token and user data from localStorage

## Project Structure

```
admin/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── index.css
    └── App.jsx
```

## Development

### Adding New Features

1. Add new route in `App.jsx` Routes component
2. Create new component function
3. Add navigation link in Sidebar component
4. Implement API calls with axios
5. Add loading states and error handling
6. Add toast notifications for user feedback

### Styling

The project uses Tailwind CSS. Refer to [Tailwind CSS documentation](https://tailwindcss.com/docs) for utility classes.

## License

This project is part of KhanhMelody platform.
