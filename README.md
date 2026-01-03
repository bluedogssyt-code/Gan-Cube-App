# GAN Cube Web Application

A cutting-edge web application leveraging Generative Adversarial Networks (GANs) for advanced image generation and manipulation on Rubik's cubes. This project combines deep learning techniques with an intuitive web interface to create unique, AI-generated cube designs.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## 🎯 Overview

The GAN Cube Web Application is a sophisticated tool designed to generate and visualize AI-powered Rubik's cube designs. By utilizing Generative Adversarial Networks, the application can create novel, realistic cube patterns that go beyond traditional manual designs. This application is ideal for designers, hobbyists, educators, and researchers exploring the intersection of AI and creative applications.

### Key Capabilities

- **AI-Powered Generation**: Generate unique cube designs using advanced GAN models
- **Real-time Visualization**: Interactive 3D cube rendering and manipulation
- **Batch Processing**: Generate multiple designs efficiently
- **Customization**: Fine-tune generation parameters for desired outputs
- **Export Options**: Download generated designs in multiple formats
- **User-Friendly Interface**: Intuitive web-based UI requiring no technical expertise

## ✨ Features

### Core Features

- **GAN-Based Design Generation**
  - State-of-the-art GAN models trained on extensive cube design datasets
  - Support for multiple generation modes (random, guided, interpolation)
  - Adjustable generation parameters for fine-grained control

- **Interactive 3D Visualization**
  - Real-time 3D cube rendering using WebGL
  - Rotation, zoom, and pan controls
  - Multiple viewing angles and perspectives
  - High-quality graphics rendering

- **Design Management**
  - Save favorite designs to your profile
  - Share designs with community
  - Design history and tracking
  - Comparison tools for multiple designs

- **Advanced Controls**
  - Seed-based reproducibility
  - Parameter interpolation for smooth transitions
  - Batch generation with various configurations
  - Style and color customization options

- **Export & Integration**
  - Export designs as high-resolution images (PNG, JPG, SVG)
  - 3D model export (OBJ, STL formats)
  - API access for third-party integrations
  - Print-ready file formats

- **User Accounts**
  - User authentication and authorization
  - Personal design galleries
  - Preference management
  - Usage analytics and statistics

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js / Vue.js (specify as applicable)
- **3D Rendering**: Three.js / Babylon.js
- **State Management**: Redux / Vuex
- **UI Components**: Material-UI / Bootstrap
- **HTTP Client**: Axios
- **Build Tool**: Webpack / Vite

### Backend
- **Runtime**: Node.js / Python (specify as applicable)
- **Framework**: Express.js / Django / FastAPI
- **Database**: MongoDB / PostgreSQL
- **ML Framework**: TensorFlow / PyTorch
- **Task Queue**: Celery / Bull
- **Cache**: Redis
- **API**: RESTful / GraphQL

### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes (optional)
- **CI/CD**: GitHub Actions / Jenkins
- **Cloud Provider**: AWS / Google Cloud / Azure
- **Monitoring**: Prometheus / Grafana
- **Logging**: ELK Stack / CloudWatch

### ML/AI Components
- **Model Training**: PyTorch / TensorFlow
- **Model Serving**: TensorFlow Serving / TorchServe
- **Model Format**: ONNX / SavedModel

## 🚀 Installation

### Prerequisites

- **Node.js**: v16.0.0 or higher (for JavaScript/frontend)
- **Python**: v3.8 or higher (for backend services)
- **Docker**: v20.10 or higher (optional, for containerized deployment)
- **Git**: v2.30 or higher

### Local Development Setup

1. **Clone the Repository**
```bash
git clone https://github.com/bluedogssyt-code/Gan-Cube-App.git
cd Gan-Cube-App
```

2. **Install Dependencies**

For the frontend:
```bash
cd frontend
npm install
# or
yarn install
```

For the backend:
```bash
cd backend
pip install -r requirements.txt
# or
npm install
```

3. **Configure Environment Variables**

Create a `.env` file in the root directory:
```env
# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=ws://localhost:5000
REACT_APP_MAX_FILE_SIZE=10485760

# Backend Configuration
NODE_ENV=development
PORT=5000
DEBUG=true
DATABASE_URL=mongodb://localhost:27017/gan-cube
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key

# ML Server Configuration
ML_SERVER_URL=http://localhost:8000
MODEL_PATH=/models/gan_cube_generator.onnx

# Optional: Cloud Storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=gan-cube-designs
```

4. **Start Development Servers**

Backend:
```bash
cd backend
npm start
# or
python app.py
```

Frontend:
```bash
cd frontend
npm start
# or
yarn dev
```

ML Server (if separate):
```bash
cd ml-server
python server.py
```

Visit `http://localhost:3000` (frontend) and `http://localhost:5000` (API).

### Docker Setup

```bash
docker-compose -f docker-compose.dev.yml up -d
```

## 📖 Usage

### Web Interface

1. **Accessing the Application**
   - Open your web browser and navigate to `http://localhost:3000`
   - Create an account or log in with existing credentials

2. **Generating a Design**
   - Click the "Generate" button on the main interface
   - Adjust generation parameters as desired:
     - **Seed**: For reproducible designs (optional)
     - **Complexity**: Level of pattern complexity (1-10)
     - **Color Palette**: Choose color scheme
     - **Style**: Select design style preferences
   - Click "Generate" and wait for processing

3. **Viewing Your Design**
   - The 3D cube preview displays immediately
   - Use mouse controls to rotate and inspect
   - Zoom to examine details

4. **Saving Your Design**
   - Click the "Save" button to add to your gallery
   - Provide a name and description
   - Optionally add tags for organization

5. **Exporting Your Design**
   - Click "Export" to download files
   - Select format: PNG, JPG, SVG, OBJ, or STL
   - Choose resolution and quality settings
   - Download begins automatically

### API Usage

#### Authentication

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### Generate Design

```bash
curl -X POST http://localhost:5000/api/designs/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seed": 12345,
    "complexity": 7,
    "colorPalette": "rainbow",
    "style": "geometric"
  }'
```

#### Retrieve Design

```bash
curl -X GET http://localhost:5000/api/designs/{designId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### List User Designs

```bash
curl -X GET http://localhost:5000/api/designs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📁 Project Structure

```
Gan-Cube-App/
├── frontend/                          # React/Vue frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/               # Reusable React components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API services
│   │   ├── store/                    # State management
│   │   ├── styles/                   # CSS/SCSS files
│   │   ├── utils/                    # Utility functions
│   │   └── App.js
│   ├── package.json
│   └── README.md
│
├── backend/                           # Node.js/Python backend
│   ├── src/
│   │   ├── controllers/              # Request handlers
│   │   ├── models/                   # Database models
│   │   ├── routes/                   # API routes
│   │   ├── middleware/               # Custom middleware
│   │   ├── services/                 # Business logic
│   │   ├── utils/                    # Utility functions
│   │   └── config/                   # Configuration files
│   ├── tests/                        # Backend tests
│   ├── requirements.txt              # Python dependencies
│   ├── package.json                  # Node dependencies
│   └── README.md
│
├── ml-server/                        # ML model serving
│   ├── models/                       # Pre-trained GAN models
│   ├── server.py                     # Model serving endpoint
│   ├── train.py                      # Model training script
│   ├── requirements.txt
│   └── README.md
│
├── docs/                             # Documentation
│   ├── api-documentation.md
│   ├── setup-guide.md
│   ├── architecture.md
│   └── deployment-guide.md
│
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .github/
│   └── workflows/                    # CI/CD workflows
│       ├── tests.yml
│       ├── build.yml
│       └── deploy.yml
├── .env.example
├── .gitignore
└── README.md
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh` | Refresh auth token |

### Design Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/designs` | List user designs |
| POST | `/designs/generate` | Generate new design |
| GET | `/designs/{id}` | Get design details |
| PUT | `/designs/{id}` | Update design |
| DELETE | `/designs/{id}` | Delete design |
| POST | `/designs/{id}/export` | Export design |

### Gallery Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gallery/public` | Get public designs |
| GET | `/gallery/trending` | Get trending designs |
| POST | `/designs/{id}/like` | Like a design |
| POST | `/designs/{id}/share` | Share design |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PUT | `/users/profile` | Update profile |
| GET | `/users/settings` | Get user settings |
| PUT | `/users/settings` | Update settings |

## ⚙️ Configuration

### Environment Variables

Key configuration options:

- **API_URL**: Backend API endpoint
- **ML_SERVER_URL**: Machine learning server endpoint
- **DATABASE_URL**: Database connection string
- **REDIS_URL**: Redis cache connection
- **JWT_SECRET**: Secret key for JWT tokens
- **NODE_ENV**: Environment (development/production/test)
- **DEBUG**: Enable debug logging
- **MAX_UPLOAD_SIZE**: Maximum file upload size
- **CORS_ORIGIN**: CORS allowed origins

### Feature Flags

Enable/disable features through configuration:

```json
{
  "features": {
    "batchGeneration": true,
    "communityGallery": true,
    "designSharing": true,
    "advancedExport": true,
    "apiAccess": true
  }
}
```

## 👨‍💻 Development

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
# or
pytest

# All tests
npm run test:all
```

### Code Style

This project follows industry-standard coding conventions:

- **JavaScript/TypeScript**: ESLint + Prettier
- **Python**: PEP 8 with Black formatter
- **CSS**: Stylelint

Run linting:
```bash
npm run lint
npm run lint:fix
```

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add feature description"`
3. Push to remote: `git push origin feature/your-feature`
4. Create a Pull Request on GitHub
5. Await review and merge

## 🧪 Testing

### Test Coverage

- Unit tests for core functions
- Integration tests for API endpoints
- E2E tests for user workflows
- ML model validation tests

### Running Test Suite

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/auth.test.js

# Watch mode
npm test -- --watch
```

## 🚢 Deployment

### Production Build

```bash
cd frontend
npm run build

cd ../backend
npm run build
```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment

Instructions for deploying to major cloud providers:

- **AWS**: See `docs/deployment-guide.md`
- **Google Cloud**: See `docs/deployment-guide.md`
- **Azure**: See `docs/deployment-guide.md`

### Environment Setup for Production

```env
NODE_ENV=production
REACT_APP_API_URL=https://api.yourdomain.com
DATABASE_URL=your_production_database_url
REDIS_URL=your_production_redis_url
JWT_SECRET=your_secure_random_secret
SSL_CERTIFICATE=/path/to/cert
SSL_KEY=/path/to/key
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Before You Start
- Check existing issues and pull requests
- Discuss major changes by opening an issue first
- Follow our Code of Conduct

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit with clear messages (`git commit -m 'Add AmazingFeature'`)
7. Push to the branch (`git push origin feature/AmazingFeature`)
8. Open a Pull Request

### Pull Request Requirements
- Clear description of changes
- Related issue numbers
- All tests passing
- Updated documentation as needed
- No breaking changes (or documented in PR)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

### Getting Help

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Search existing issues or create a new one
- **Discussions**: Join our community discussions
- **Email**: Contact team at support@example.com

### Reporting Bugs

When reporting bugs, include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment information
- Screenshots if applicable

### Feature Requests

Have an idea? We'd love to hear it! Please open a feature request issue with:
- Clear description of the feature
- Use case and benefits
- Suggested implementation (optional)
- Any related references

## 📊 Performance & Optimization

- Models optimized for inference speed
- Caching layer for frequently generated designs
- Progressive loading for large datasets
- Lazy loading of 3D models
- Image compression and optimization

## 🔒 Security

- JWT-based authentication
- HTTPS/TLS encryption
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Secure password hashing (bcrypt)
- Environment variable protection

## 🗺️ Roadmap

- [ ] Advanced model fine-tuning
- [ ] Multi-user collaboration
- [ ] AR visualization
- [ ] Mobile app
- [ ] Community marketplace
- [ ] Custom model training
- [ ] Real-time multiplayer generation

## 📞 Contact & Social

- **GitHub**: [bluedogssyt-code/Gan-Cube-App](https://github.com/bluedogssyt-code/Gan-Cube-App)
- **Issues**: [GitHub Issues](https://github.com/bluedogssyt-code/Gan-Cube-App/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bluedogssyt-code/Gan-Cube-App/discussions)

---

**Last Updated**: January 3, 2026

**Maintained by**: bluedogssyt-code

Thank you for your interest in the GAN Cube Web Application! 🎉
