# Trip Planner Frontend

A React TypeScript frontend for the Group Trip Planner application, built with Vite for fast development and optimized builds.

## Tech Stack

- **React 18** with TypeScript for type-safe component development
- **Vite** for lightning-fast development and optimized production builds
- **Tailwind CSS** for utility-first styling
- **React Router** for client-side routing
- **React Query** for server state management and API integration
- **Vitest** for unit and integration testing
- **ESLint + Prettier** for code quality and formatting

## Features

- **Trip Management**: Create, view, and manage group trips
- **Participant Management**: Add and manage trip participants
- **Responsive Design**: Mobile-first responsive UI
- **Real-time Updates**: Optimistic updates with React Query
- **Type Safety**: Full TypeScript integration
- **Modern Development**: Hot module replacement and fast refresh

## API Integration

The frontend integrates with the Trip Planner API backend:

### Backend API Endpoints
- `POST /api/trips` - Create new trips
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip information
- `POST /api/trips/:id/participants` - Add participants
- `DELETE /api/trips/:id/participants/:id` - Remove participants

### Authentication
All API requests include authentication via the `X-User-Id` header. The frontend manages user sessions and ensures proper authorization for trip access.

## Development Setup

### Prerequisites
- Node.js 20+ and npm
- Backend API running on port 3001

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
The frontend will be available at http://localhost:5173

### Building for Production
```bash
npm run build
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
