# 🛡️ Anti-Phishing App

A comprehensive, professional-grade anti-phishing detection platform built with React and modern web technologies. This application provides advanced URL scanning, threat detection, and security analytics for both users and administrators.

## ✨ Features

### 🔍 Core Functionality
- **Advanced URL Scanning**: AI-powered phishing detection with real-time analysis
- **Threat Reporting**: Community-driven threat intelligence system
- **Risk Assessment**: Comprehensive scoring system (HIGH/MEDIUM/LOW)
- **Real-time Analytics**: Interactive charts and dashboards

### 👤 User Features
- **Personal Dashboard**: Customized security overview with scan history
- **Quick URL Scanner**: Instant threat detection from dashboard
- **Profile Management**: Complete user profile with picture upload
- **Security Tips**: Educational content and best practices
- **Scan History**: Track all previous URL scans with detailed results

### 👨‍💼 Admin Features
- **Admin Control Center**: Comprehensive system management dashboard
- **Advanced Analytics**: Multi-chart threat visualization (Bar, Pie, Line charts)
- **User Management**: Monitor and manage system users
- **Threat Trends**: Historical data analysis and reporting
- **System Statistics**: Real-time platform metrics

### 🎨 Design & UX
- **Professional UI**: Modern, responsive design with smooth animations
- **Role-based Themes**: Different color schemes for users and admins
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: WCAG compliant design patterns
- **Dark Mode Support**: Eye-friendly interface options

## 🚀 Technology Stack

### Frontend
- **React 19.2.4**: Latest React with modern hooks and features
- **React Router DOM 7.13.0**: Advanced routing and navigation
- **Recharts 3.7.0**: Interactive data visualization
- **Styled-JSX**: CSS-in-JS styling solution
- **Axios**: HTTP client for API communication

### Styling & Animation
- **CSS-in-JS**: Component-scoped styling
- **CSS Animations**: Smooth transitions and micro-interactions
- **Responsive Design**: Mobile-first approach
- **Modern Gradients**: Professional color schemes

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API server (separate repository)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anti-phishing-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure API endpoint**
   Update the API base URL in `src/api.js`:
   ```javascript
   const api = axios.create({
     baseURL: \"http://localhost:5000/api\" // Update with your backend URL
   });
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/           # Reusable React components
│   ├── AdminRoute.jsx   # Admin route protection
│   ├── UserRoute.jsx    # User route protection
│   └── ...
├── pages/               # Main application pages
│   ├── Login.jsx        # Authentication page
│   ├── Register.jsx     # User registration
│   ├── Home.jsx         # User dashboard
│   ├── AdminDashboard.jsx # Admin control center
│   ├── Profile.jsx      # User/Admin profiles
│   ├── Scan.jsx         # URL scanning interface
│   └── Report.jsx       # Threat reporting
├── utils/               # Utility functions
├── api.js              # API configuration
├── App.js              # Main application component
└── index.js            # Application entry point
```

## 🔐 Authentication & Authorization

### User Roles
- **User**: Can scan URLs, report threats, manage personal profile
- **Admin**: Full system access, analytics, user management

### Route Protection
- Public routes: Login, Register
- Protected routes: Dashboard, Profile, Scan, Report
- Admin-only routes: Admin Dashboard, System Analytics

### Security Features
- JWT token-based authentication
- Role-based access control
- Secure API communication
- Input validation and sanitization

## 📊 Dashboard Features

### User Dashboard
- **Quick URL Scanner**: Instant scanning from dashboard
- **Statistics Overview**: Personal scan metrics
- **Recent Activity**: Scan history with risk levels
- **Security Tips**: Educational content
- **Profile Integration**: User info with picture support

### Admin Dashboard
- **System Statistics**: Total threats, users, risk distribution
- **Interactive Charts**: Bar, Pie, and Line charts
- **Threat Trends**: Historical analysis
- **Recent Reports**: Community threat submissions
- **User Management**: System user overview

## 🎯 URL Scanning Process

1. **Input Validation**: URL format and security checks
2. **API Request**: Secure transmission to backend
3. **AI Analysis**: Advanced threat detection algorithms
4. **Risk Assessment**: Comprehensive scoring system
5. **Result Display**: Detailed threat analysis with recommendations
6. **History Tracking**: Automatic scan logging

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptive Features
- Flexible grid layouts
- Collapsible navigation
- Touch-friendly interfaces
- Optimized image loading

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_VERSION=1.0.0
```

### API Configuration
Update `src/api.js` for custom backend integration:
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || \"http://localhost:5000/api\",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
# or
yarn build
```

### Deployment Options
- **Netlify**: Drag and drop `build` folder
- **Vercel**: Connect GitHub repository
- **AWS S3**: Upload build files to S3 bucket
- **Docker**: Use provided Dockerfile

## 🧪 Testing

### Run Tests
```bash
npm test
# or
yarn test
```

### Test Coverage
- Component rendering tests
- User interaction tests
- API integration tests
- Route protection tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Complete user and admin dashboards
- Advanced URL scanning
- Professional UI/UX design
- Mobile responsive layout
- Role-based authentication

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced threat intelligence
- [ ] API rate limiting
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Export functionality
- [ ] Advanced user permissions
- [ ] Integration with security APIs

---

**Built with ❤️ for cybersecurity and user protection**