# Flare Tools

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A platform for discovering, reviewing, and sharing developer tools. Built with modern web technologies to help developers find the best tools for their projects.

## ✨ Features

- 🔐 User authentication (Email/Password & Google)
- 📝 Tool submission and management
- ⭐ Tool ratings and reviews
- 🔍 Search and filter tools by category
- 👍 Upvote/downvote system
- 📱 Responsive design for all devices
- 🛠️ Admin dashboard for content management

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/flare-tools.git
   cd flare-tools
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a new Firebase project
   - Enable Email/Password and Google authentication
   - Create a Firestore database
   - Set up Firebase Storage
   - Add your Firebase config to `js/firebase-config.js`

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Project Structure

```
flare-tools/
├── css/                  # Stylesheets
├── js/                   # JavaScript files
│   ├── auth.js           # Authentication logic
│   ├── firebase-config.js # Firebase configuration
│   ├── main.js           # Main application logic
│   └── ...
├── index.html            # Homepage
├── tools.html            # Tools listing page
├── submit-tool.html      # Tool submission form
├── admin.html            # Admin dashboard
└── README.md             # This file
```

## 🔧 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Icons**: Heroicons
- **Build Tools**: Vite (recommended)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project.
- Built with ❤️ for the developer community.
