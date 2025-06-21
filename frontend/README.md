# StudyFlow - Your Personal Study Planner

A comprehensive study planning application with integrated music features and AI-powered quiz generation to enhance your learning experience.

## 🚀 Features

- **📅 Study Session Management**: Create, schedule, and track study sessions
- **⏱️ Timer with Focus Mode**: Built-in timer with distraction-free focus mode
- **🧠 AI-Powered Quiz Hub**: Generate intelligent quizzes from any content
  - **Document Analysis**: Upload PDFs, Word docs, and text files
  - **YouTube Integration**: Generate quizzes from educational videos
  - **Image Processing**: Create questions from educational images with AI vision
  - **Smart Question Generation**: Gemini AI analyzes content for meaningful questions
- **🎵 Music Integration**: Multiple music platforms for study ambiance
  - **Spotify**: Connect your account for personalized playlists
  - **YouTube Music**: Play any YouTube video or playlist
  - **Jamendo**: Free instrumental and ambient music
- **📊 Progress Tracking**: Monitor your study progress and completion rates
- **🎨 Beautiful UI**: Modern, responsive design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide React Icons
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Google Gemini 1.5 Flash for quiz generation
- **File Storage**: Supabase Storage
- **Deployment**: Vercel
- **Music APIs**: Jamendo, YouTube, Spotify (planned)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KestonCCole5654/Study-Planner-App.git
   cd Study-Planner-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your API credentials:
   ```env
   VITE_JAMENDO_CLIENT_ID=your_jamendo_client_id_here
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

### Required for Quiz Hub (AI Features)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for quiz generation | `AIza...` |

### Required for Music Features

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_JAMENDO_CLIENT_ID` | Jamendo API client ID | `0f57f15a` |

### Required for Database

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Future API Integrations

| Variable | Description | Status |
|----------|-------------|--------|
| `VITE_SPOTIFY_CLIENT_ID` | Spotify Web API client ID | 🚧 Planned |
| `VITE_YOUTUBE_API_KEY` | YouTube Data API key | 🚧 Planned |

## 🧠 AI Quiz Generation Setup

### Google Gemini Integration
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini
3. Add `VITE_GEMINI_API_KEY=your_api_key` to your `.env.local`
4. The app will automatically detect the API key and enable AI features

### Supported Content Types
- **Documents**: PDF, Word (.docx), Text files (.txt, .md)
- **Videos**: YouTube URLs, MP4, WebM files
- **Images**: PNG, JPG, JPEG, WebP (with AI vision analysis)

### AI Features
- **Advanced Content Analysis**: Gemini AI reads and understands your study materials
- **Vision Capabilities**: AI can analyze images and extract educational content
- **Context-Aware Questions**: Generates relevant questions based on content
- **Difficulty Levels**: Easy, Medium, Hard, or Mixed difficulty options
- **Customizable**: Choose number of questions (3-20)
- **Multiple Formats**: Flashcards, short-answer, and multiple-choice questions

## 🎵 Music Integration Setup

### Jamendo (Free Music)
1. Sign up at [Jamendo](https://www.jamendo.com/)
2. Get your client ID from the developer dashboard
3. Add `VITE_JAMENDO_CLIENT_ID=your_client_id` to your `.env.local`

### Spotify (Premium Features)
- Coming soon! Will require Spotify Premium account

### YouTube Music
- Currently supports direct URL/ID input
- Full API integration planned

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository** to Vercel
2. **Add environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env.local` file
3. **Deploy** - Vercel will automatically deploy on every push

### Environment Variables in Vercel

Make sure to add these in your Vercel project settings:

```env
VITE_JAMENDO_CLIENT_ID=0f57f15a
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_key
```

## 📱 Usage

### Study Sessions
1. **Create Study Sessions**: Plan your study time with subjects and durations
2. **Use the Timer**: Start focused study sessions with built-in timer
3. **Track Progress**: Monitor your study habits and completion rates

### Quiz Hub
1. **Upload Content**: Add documents, images, or YouTube videos
2. **AI Generation**: Let Gemini AI analyze your content and create intelligent questions
3. **Study Modes**: Use flashcards or take full quizzes
4. **Customize**: Choose difficulty levels and number of questions

### Music Integration
1. **Choose Platform**: Select from Spotify, YouTube, or Jamendo
2. **Search Content**: Find study music, playlists, or ambient sounds
3. **Focus Mode**: Play music during study sessions for better concentration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI-powered quiz generation
- [Jamendo](https://www.jamendo.com/) for free music API
- [Supabase](https://supabase.com/) for backend services
- [Vercel](https://vercel.com/) for hosting
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 🔮 Roadmap

- [ ] Advanced OCR for image text extraction
- [ ] YouTube transcript integration
- [ ] Spotify Premium integration
- [ ] Collaborative study sessions
- [ ] Advanced analytics and insights
- [ ] Mobile app development
- [ ] Offline mode support
- [ ] Multi-language support for Gemini AI