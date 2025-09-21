# NSU Debate Club Website

Official website for the North South University Debate Club (NSUDC), showcasing club information, events, achievements, and member registration.

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Navigate** to the project directory in your terminal
3. **Start the local server**:
   ```powershell
   python -m http.server 8000
   ```
4. **Open your browser** and visit: [http://localhost:8000](http://localhost:8000)

## 📁 Project Structure

```
NSUDC_project/
├── index.html              # Homepage
├── about.html              # About page
├── achievements.html       # Achievements page
├── events.html             # Events listing page
├── register.html           # Registration form
├── coming-soon.html        # Coming soon template
├── fall-25.html           # Fall 2025 recruitment page
├── styles.css             # Main CSS styles
├── include.js             # Component inclusion script
├── components/            # Reusable HTML components
│   ├── header.html        # Site header
│   └── footer.html        # Site footer
├── js/                    # JavaScript files
│   ├── app.js            # Main homepage functionality
│   ├── events.js         # Events page functionality
│   ├── register.js       # Registration form logic
│   ├── coming-soon.js    # Coming soon countdown
│   └── fall-25.js        # Fall 2025 specific features
├── data/                  # JSON data files
│   ├── data.json         # Homepage content data
│   ├── events.json       # Events data
│   └── fall-25.json      # Fall 2025 recruitment data
├── images/               # Image assets
│   ├── Facebook Event Cover.jpg
│   ├── Recruitment Title w tag.png
│   └── break_the_script.png.jpeg
├── *.png                 # Logo files
└── README.md            # This file
```

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **Tailwind CSS** - Utility-first CSS framework (via CDN)
- **Vanilla JavaScript** - Dynamic functionality
- **JSON** - Data storage
- **Python HTTP Server** - Local development server

## 🔧 Development

### Prerequisites
- Python 3.x installed on your system
- Modern web browser

### Running Locally
1. Open terminal/PowerShell in project directory
2. Start the server:
   ```bash
   python -m http.server 8000
   ```
3. Open [http://localhost:8000](http://localhost:8000)

### Making Changes
- **Content**: Edit JSON files in `data/` directory
- **Styling**: Modify `styles.css` or use Tailwind classes
- **Functionality**: Update JavaScript files in `js/` directory
- **Structure**: Edit HTML files directly

## 📄 Pages Overview

| Page | Description | Key Features |
|------|-------------|--------------|
| `index.html` | Homepage | Hero section, popular content, announcements |
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
3. **Fall 2025 info**: Modify `data/fall-25.json`

## 🚀 Deployment

For production deployment:

1. **Static hosting** (recommended):
   - Upload all files to your web server
   - Ensure proper MIME types are configured

2. **GitHub Pages**:
   - Push to GitHub repository
   - Enable GitHub Pages in repository settings

3. **Vercel/Netlify**:
   - Connect your repository
   - Deploy automatically

## 📝 License

© 2025 NSU Debate Club. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📞 Contact

- **Email**: debate.club@northsouth.edu
- **Facebook**: [NSUDC93](https://www.facebook.com/NSUDC93)
- **LinkedIn**: [nsudc](https://www.linkedin.com/company/nsudc/)
- **Instagram**: [@nsudc](https://www.instagram.com/nsudc)

---

**Note**: This is a static website that runs in any modern web browser. No backend server or database is required for basic functionality.