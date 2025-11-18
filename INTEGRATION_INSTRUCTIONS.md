# Integration Instructions

## Files Created/Modified

### ✅ Backend
- ✅ `server.js` - Express server with Gemini API integration
- ✅ `package.json` - Added dependencies (express, @google/generative-ai, cors, express-rate-limit)
- ✅ `.env.example` - Added GEMINI_API_KEY and PORT configuration

### ✅ Frontend JavaScript
- ✅ `js/gemini-motion.js` - Gemini API client module with retry logic and fallback
- ✅ `js/app.js` - Updated motion generator logic to use Gemini API

### ⚠️ HTML (Manual Step Required)

The `index.html` file needs manual updates. I've created `motion-ui-snippet.html` with the HTML code that needs to be inserted.

**Steps to complete:**

1. Open `index.html` in your editor
2. Find line 48-52 (the script tags section)
3. Add this line after line 49:
   ```html
   <script src="js/gemini-motion.js?v=20250922" defer></script>
   ```

4. Find the motion generator section (around line 153-166)
5. Replace the content between the motion-topic `<p>` tag and the buttons `<div>` with the content from `motion-ui-snippet.html`

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```
   ✅ Already completed

2. **Configure API Key:**
   - Copy `.env.example` to `.env`
   - Add your Gemini API key to the `GEMINI_API_KEY` variable
   - Get a free API key from: https://makersuite.google.com/app/apikey

3. **Start the Server:**
   ```bash
   npm run dev
   ```

4. **Test the Application:**
   - Open http://localhost:3000 in your browser
   - Select a topic from the dropdown
   - Click "New Motion" to generate an AI-powered debate motion
   - The system will automatically fall back to static motions if Gemini is unavailable

## Features Implemented

✅ **Gemini AI Integration**
- AI-powered motion generation based on topic and format
- Automatic retry with exponential backoff
- Graceful fallback to static motions on failure

✅ **Topic Selection**
- 10 predefined topic categories
- Custom topic input option
- Format selection (BP, Asian, WUDC, Australs, American)

✅ **Improved Reliability**
- Request timeout handling (10 seconds)
- Connection status detection
- Better error messages
- Loading state indicators
- Offline fallback support

✅ **User Experience**
- Loading spinner during AI generation
- Toast notifications for feedback
- Maintains motion history
- Copy to clipboard functionality

## Testing

The implementation is ready to test once the HTML changes are applied. The system will work with or without the Gemini API key - it gracefully falls back to static motions if the API is unavailable.
