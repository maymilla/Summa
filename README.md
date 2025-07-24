# Summa

A comprehensive perspective discovery platform that aggregates diverse viewpoints on topics by scraping, clustering, and summarizing content from multiple sources with community-driven fact-checking.

## Overview

Summa is a Next.js application that helps users discover multiple perspectives on any topic. When users search for a topic, the application either retrieves existing perspectives from the database or scrapes the web to gather articles, clusters them using machine learning, and presents different viewpoints with community notes for fact-checking.

## Key Features

### 🔍 **Intelligent Search & Scraping**
- Search for any topic and get diverse perspectives
- Automatic web scraping using SerpAPI when topics don't exist in database
- Smart content extraction from news articles and web pages
- Batch processing with retry mechanisms for reliable data collection

### 🤖 **AI-Powered Content Processing**
- **Article Clustering**: Python-based machine learning clustering to group similar articles
- **Text Summarization**: Powered by Facebook's BART Large CNN model via Hugging Face
- **Perspective Generation**: Automatic creation of different viewpoints from clustered content
- **Content Normalization**: Clean and filter scraped content for quality

### 👥 **Community-Driven Fact-Checking**
- **Community Notes**: Users can add context, corrections, or additional information
- **Voting System**: Upvote/downvote community notes for quality control
- **Top-Scoring Notes**: Display most helpful community contributions
- **User Authentication**: Secure login system for note submission

### 🎨 **Modern User Interface**
- Responsive design with smooth animations
- Gradient backgrounds and hover effects
- Clean, intuitive search interface
- Modal-based interactions for community notes

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Styled Components** for component styling
- **React Hooks** for state management

### Backend
- **Next.js API Routes** for serverless functions
- **Prisma ORM** for database operations
- **PostgreSQL/MySQL** database (configurable)
- **bcryptjs** for password hashing

### AI & ML Services
- **Hugging Face Inference API** for text summarization
- **Python clustering script** for article grouping
- **SerpAPI** for web search results

### Authentication
- **Cookie-based sessions** for user management
- **Secure password hashing** with bcrypt
- **Protected routes** and API endpoints

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── comm/               # Community notes API
│   │   ├── scrape/             # Web scraping & clustering
│   │   ├── summarize/          # Text summarization
│   │   ├── topics/             # Topic management
│   │   └── users/              # User management
│   ├── auth/                   # Authentication pages
│   ├── explore/                # Topic exploration
│   ├── search/                 # Main search interface
│   └── topic/[id]/            # Individual topic pages
├── components/                  # Reusable React components
│   ├── AddNoteModal.tsx        # Community note submission
│   ├── Header.tsx              # Navigation header
│   ├── PerspectiveWithCommunityNotes.tsx
│   ├── TextSummarizer.tsx      # Standalone summarization tool
│   └── TopicCard.tsx           # Topic display cards
├── contexts/                   # React contexts
├── data/                       # Static data and mock content
├── lib/                        # Utility libraries
├── prisma/                     # Database schema and migrations
├── python/                     # Python clustering scripts
├── types/                      # TypeScript type definitions
└── public/                     # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset

### Topics & Content
- `GET /api/topics` - List all topics
- `POST /api/topics` - Create new topic
- `GET /api/topics/[id]` - Get specific topic
- `GET /api/scrape` - Search/scrape topics
- `POST /api/summarize` - Summarize text content

### Community Features
- `GET /api/comm` - Get community notes
- `POST /api/comm` - Create community note
- `PUT /api/comm/[id]` - Update community note
- `DELETE /api/comm/[id]` - Delete community note
- `POST /api/comm/[id]/vote` - Vote on community note

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Database (PostgreSQL/MySQL)
- Environment variables (see below)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd summa
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
# Database
DATABASE_URL="your-database-connection-string"

# API Keys
HUGGINGFACE_API_KEY="your-huggingface-api-key"
SERP_API_KEY="your-serpapi-key"

# App Configuration
NODE_ENV="development"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open the application**
Visit [http://localhost:3000](http://localhost:3000)

## Usage

### Searching for Perspectives
1. Enter a topic in the search bar on the main page
2. If the topic exists, see related topics from the database
3. If not found, the system will scrape the web and create new perspectives
4. View different perspectives with sources and community notes

### Adding Community Notes
1. Log in to your account
2. Click "Add Note" on any perspective
3. Write your note (corrections, context, additional info)
4. Submit for community review
5. Vote on other users' notes

### Text Summarization
- Use the standalone summarizer at `/summarize`
- Paste text and get AI-powered summaries
- Adjustable length and parameters

## Database Schema

The application uses the following main entities:

- **User**: User accounts and authentication
- **Topic**: Main topic entries with title and description  
- **Perspective**: Different viewpoints on topics
- **Source**: References and links for perspectives
- **Comm**: Community notes and fact-checking
- **Vote**: Voting system for community notes

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `HUGGINGFACE_API_KEY` | Hugging Face API key for summarization | Yes |
| `SERP_API_KEY` | SerpAPI key for web search | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

For other platforms, ensure you have:
- Node.js runtime
- Database connection
- Required API keys
- Python environment for clustering

## Support

For questions or issues:
- Create an issue on GitHub
- Check the documentation
- Review API endpoint specifications

---

**Summa** - Discover diverse perspectives on any topic through AI-powered content aggregation and community-driven fact-checking.