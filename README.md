# NSU Debate Club Website

Official website for the North South University Debate Club (NSUDC), showcasing club information, events, achievements, and member registration.

## ✨ New Features

🤖 **AI-Powered Motion Generator** - Generate unique debate motions using Google Gemini AI
🎯 **Topic Selection** - Choose from 10 categories or create custom topics
📋 **Format Support** - BP, Asian, WUDC, Australs, and American Parliamentary formats
⚡ **Smart Fallback** - Automatically uses static motions when AI is unavailable
📊 **Motion History** - Track all your practice motions

## 🚀 Quick Start

### Option 1: With AI Motion Generation (Recommended)

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Gemini API** (optional but recommended):
   - Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Copy `.env.example` to `.env`
   - Add your API key: `GEMINI_API_KEY=your_key_here`
4. **Start the server**:
   ```bash
   npm run dev
   ```
5. **Open your browser** and visit: [http://localhost:3000](http://localhost:3000)

### Option 2: Static Site Only

1. **Clone or download** this repository
2. **Start a local server**:
   ```bash
   python -m http.server 8000
   ```
3. **Open your browser** and visit: [http://localhost:8000](http://localhost:8000)

> **Note**: Without the Node.js server, the AI motion generator will use static motions from the database.

## 📁 Project Structure

```
debate-club-website-javascript/
├── server.js                  # Express server with Gemini AI integration
├── index.html                 # Homepage with motion generator
├── about.html                 # About page
├── achievements.html          # Achievements page
├── events.html                # Events listing page
├── register.html              # Registration form
├── coming-soon.html           # Coming soon template
├── fall-25.html              # Fall 2025 recruitment page
├── styles.css                # Main CSS styles
├── include.js                # Component inclusion script
├── components/               # Reusable HTML components
│   ├── header.html           # Site header
│   └── footer.html           # Site footer
├── js/                       # JavaScript files
│   ├── app.js               # Main homepage functionality
│   ├── gemini-motion.js     # Gemini AI integration module
│   ├── events.js            # Events page functionality
│   ├── register.js          # Registration form logic
│   ├── animations.js        # Animation utilities
│   ├── interactive.js       # Interactive behaviors
│   └── performance.js       # Performance monitoring
├── data/                     # JSON data files
│   ├── motions.json         # Static debate motions
│   ├── announcements.json   # Site announcements
│   ├── events.json          # Events data
│   └── social-pulse.json    # Social media feed
├── scripts/                  # Utility scripts
│   ├── fetch-social.js      # Social media fetch script
│   └── exchange-tokens.js   # Token exchange utility
├── .env.example             # Environment variables template
└── package.json             # Node.js dependencies
```

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **Tailwind CSS** - Utility-first CSS framework (via CDN)
- **Vanilla JavaScript** - Dynamic functionality
- **Service Worker** - PWA support and offline functionality

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web server framework
- **Google Gemini AI** - AI-powered motion generation
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API abuse prevention

### Data & Tools
- **JSON** - Data storage
- **dotenv** - Environment variable management

## 🔧 Development

### Prerequisites
- **Node.js 18+** - For running the server and AI features
- **Python 3.x** - Alternative for static site hosting
- **Modern web browser** - Chrome, Firefox, Edge, Safari

### Running Locally

#### Full Stack (with AI)
```bash
# Install dependencies
npm install

# Configure environment (optional)
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start development server
npm run dev

# Server will run on http://localhost:3000
```

#### Static Site Only
```bash
# Start Python HTTP server
python -m http.server 8000

# Site will run on http://localhost:8000
```

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Gemini AI Configuration (optional)
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000

# Social Media API Configuration (optional)
FACEBOOK_PAGE_ID=your_facebook_page_id
FACEBOOK_ACCESS_TOKEN=your_facebook_token
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_id
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
LINKEDIN_ORG_ID=your_linkedin_org_id
```

### AI Motion Generator

The motion generator uses Google Gemini AI to create unique debate motions:

**Features:**
- 🎯 Topic selection (10 predefined + custom)
- 📋 Format selection (BP, Asian, WUDC, Australs, American)
- 🔄 Automatic retry with exponential backoff
- ⏱️ 10-second timeout per request
- 📊 Motion history tracking
- 💾 Graceful fallback to static motions

**API Endpoint:**
```
POST /api/generate-motion
Content-Type: application/json

{
  "topic": "Technology & Society",
  "format": "British Parliamentary"
}
```

### Automating the Social Pulse Feed

If you want the **Social Pulse** section to pull real posts from Facebook, Instagram, and LinkedIn:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env` with social media credentials
3. Fetch latest posts:
   ```bash
   npm run fetch:social
   ```
4. Optional custom output:
   ```bash
   npm run fetch:social -- --out=data/social-pulse.json
   ```

> ⚠️ All three APIs require approved apps and tokens; the script orchestrates the calls. Missing credentials will skip that platform.

### Making Changes
- **Content**: Edit JSON files in `data/` directory
- **Styling**: Modify `styles.css` or use Tailwind classes
- **Functionality**: Update JavaScript files in `js/` directory
- **Structure**: Edit HTML files directly
- **Server Logic**: Modify `server.js` for backend changes

## 📄 Pages Overview

| Page | Description | Key Features |
|------|-------------|--------------|
| `index.html` | Homepage | Hero, motion generator, debate timer, social pulse |
| `about.html` | About NSUDC | History, achievements, milestones |
| `achievements.html` | Awards & Recognition | Coming soon template |
| `events.html` | Events Listing | Dynamic event cards from JSON |
| `register.html` | Member Registration | Multi-step form with validation |
| `coming-soon.html` | Template Page | Countdown timer, email signup |
| `fall-25.html` | Fall 2025 Recruitment | Schedule, FAQs, registration CTA |

## 🎨 Customization

### Colors
Main colors are defined in CSS variables:
```css
:root {
  --primary: #071530;    /* NSUDC deep blue */
  --ink: #0a0a0a;        /* Text color */
  --chip-bg: #E8EEF8;    /* Light blue for pills */
}
```

### Content Updates
1. **Homepage content**: Edit `data/data.json`
2. **Events**: Update `data/events.json`
3. **Debate motions**: Modify `data/motions.json`
4. **Announcements**: Edit `data/announcements.json`

## 🚀 Deployment

### With Backend (Recommended)

**Vercel** (recommended):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

**Heroku**:
```bash
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git push heroku main
```

**Railway/Render**:
- Connect your repository
- Set environment variables
- Deploy automatically

### Static Site Only

1. **GitHub Pages**:
   - Push to GitHub repository
   - Enable GitHub Pages in settings

2. **Netlify**:
   - Connect repository
   - Deploy automatically

3. **Vercel**:
   - Import project
   - Deploy

## 🔒 Security

- ✅ API keys stored in environment variables
- ✅ Rate limiting (50 requests per 15 minutes)
- ✅ CORS configured for security
- ✅ Input validation on server side
- ✅ No sensitive data in client code

## 📊 Performance

- ⚡ Service Worker for offline support
- ⚡ Lazy loading of non-critical resources
- ⚡ Optimized asset delivery
- ⚡ Request timeout handling
- ⚡ Efficient caching strategies

## 📝 License

© 2025 NSU Debate Club. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test locally (`npm run dev`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

## 📞 Contact

- **Email**: debate.club@northsouth.edu
- **Facebook**: [NSUDC93](https://www.facebook.com/NSUDC93)
- **LinkedIn**: [nsudc](https://www.linkedin.com/company/nsudc/)
- **Instagram**: [@nsudc](https://www.instagram.com/nsudc)

## 🙏 Acknowledgments

- Google Gemini AI for motion generation
- Tailwind CSS for styling utilities
- Express.js for backend framework
- All NSUDC members and contributors

---

**Built with ❤️ by the NSU Debate Club**