# StudyFlow Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel with both frontend and backend components.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **API Keys**: You'll need several API keys for full functionality

### Required Environment Variables

#### Frontend Environment Variables (VITE_*)
Add these in your Vercel project settings:

```
VITE_JAMENDO_CLIENT_ID=your_jamendo_client_id_here
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

#### Backend Environment Variables
Add these in your Vercel project settings:

```
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
```

### API Setup Instructions

#### 1. YouTube API Setup
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing project
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key and add it as `VITE_YOUTUBE_API_KEY`
6. Optionally restrict the API key to YouTube Data API v3 for security

#### 2. Jamendo API Setup
1. Go to [Jamendo Developer Portal](https://developer.jamendo.com/)
2. Create an account and get your Client ID
3. Add it as `VITE_JAMENDO_CLIENT_ID`

#### 3. Supabase Setup
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Get your project URL and anon key from Settings > API
4. Add them as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

#### 4. Google Gemini API Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it as `VITE_GEMINI_API_KEY`

#### 5. AssemblyAI Setup
1. Go to [AssemblyAI](https://www.assemblyai.com/)
2. Create an account and get your API key
3. Add it as `ASSEMBLYAI_API_KEY`

### Deployment Steps

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Framework Preset: Other
   - Root Directory: `./` (root of the project)
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`

3. **Add Environment Variables**:
   - Go to Project Settings > Environment Variables
   - Add all the environment variables listed above

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your project

### Project Structure

```
studyflow/
├── frontend/          # React + Vite frontend
├── backend/           # Express.js backend
├── vercel.json        # Vercel configuration
├── package.json       # Root package.json
└── .gitignore         # Git ignore rules
```

### API Endpoints

After deployment, your backend API will be available at:
- `https://your-domain.vercel.app/api/transcribe` (POST)
- `https://your-domain.vercel.app/api/transcribe-status` (GET)

### Troubleshooting

1. **Build Failures**: Check that all dependencies are properly installed
2. **API Errors**: Verify all environment variables are set correctly
3. **CORS Issues**: The backend is configured with CORS for the frontend domain

### Local Development

To run the project locally:

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

This will start both frontend (port 5173) and backend (port 3001) servers.

### Notes

- The backend uses serverless functions on Vercel
- File uploads are limited by Vercel's function timeout (30 seconds)
- Consider using external storage for large files in production 