# IntelliLearn - Educational Explanation Platform

## Overview

IntelliLearn is a full-stack educational platform that allows users to explain topics in various formats (text, audio, video) and receive AI-powered feedback. The application features a gamified learning experience with XP points, badges, leaderboards, and peer interaction capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens and brand colors
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **File Uploads**: Multer middleware for handling audio/video uploads
- **Authentication**: JWT-based authentication with bcrypt for password hashing

### Database & Data Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Connection**: Neon serverless connection pool with WebSocket support
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Authentication System
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes with authentication middleware
- User registration and login endpoints

### Content Management
- Multi-format explanations (text, audio, video)
- File upload handling with size limits (50MB)
- AI-powered content evaluation using OpenAI API
- Four feedback modes: baby, troll, socratic, teacher

### Gamification Features
- XP point system with leveling
- Badge achievement system
- Daily streak tracking
- Global leaderboard with rankings
- Progress tracking and analytics

### AI Integration
- OpenAI GPT-4o for explanation evaluation
- Audio transcription capabilities
- Personalized feedback based on selected modes
- Content scoring (0-100) with detailed analysis

### Email Service
- SendGrid integration for notifications
- Report generation and email delivery
- User communication system

## Data Flow

1. **User Authentication**: JWT tokens stored in localStorage, validated on protected routes
2. **Content Creation**: Users create explanations → uploaded to server → processed by AI → stored with evaluation
3. **Gamification**: Actions trigger XP calculations → badge checks → leaderboard updates
4. **Peer Interaction**: Public explanations → voting system → community gallery
5. **Analytics**: User activity tracked → reports generated → insights delivered via email

## External Dependencies

### Core Services
- **Neon Database**: PostgreSQL hosting with serverless architecture
- **OpenAI API**: Content evaluation and transcription services
- **SendGrid**: Email delivery service for notifications and reports

### Development Tools
- **Replit Integration**: Development environment support with cartographer plugin
- **ESBuild**: Production bundling for server code
- **Drizzle Kit**: Database schema management and migrations

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **React Hook Form**: Form handling with Zod validation

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- Express server with tsx for TypeScript execution
- Database migrations via Drizzle Kit push command
- Replit-specific plugins for development tooling

### Production Build
- Frontend: Vite builds to `dist/public`
- Backend: ESBuild bundles server to `dist/index.js`
- Single deployment artifact with static file serving
- Environment variables for API keys and database connection

### Environment Configuration
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Token signing secret
- `OPENAI_API_KEY`: AI service authentication
- `SENDGRID_API_KEY`: Email service authentication
- `NODE_ENV`: Environment mode switching

The application follows a monorepo structure with shared TypeScript schemas between client and server, ensuring type safety across the full stack. The architecture supports both development and production deployments with appropriate build optimizations and environment-specific configurations.