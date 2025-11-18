import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Rate limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Initialize Gemini AI
let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✓ Gemini AI initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize Gemini AI:', error.message);
  }
} else {
  console.warn('⚠ GEMINI_API_KEY not found in environment variables');
}

// Motion generation endpoint
app.post('/api/generate-motion', async (req, res) => {
  try {
    const { topic, format } = req.body;

    if (!topic || !format) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: topic and format'
      });
    }

    if (!model) {
      return res.status(503).json({
        success: false,
        error: 'AI service not available. Please check API key configuration.',
        fallback: true
      });
    }

    // Construct prompt for Gemini
    const prompt = `Generate a single debate motion for the following parameters:
Topic: ${topic}
Format: ${format}

Requirements:
- The motion should be suitable for ${format} debate format
- It should be thought-provoking and balanced
- Follow the standard "This House..." format for parliamentary debates
- Be specific and clear
- Be relevant to the topic: ${topic}

Respond with ONLY the motion text, nothing else. Do not include explanations or additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const motion = response.text().trim();

    // Validate the response
    if (!motion || motion.length < 10) {
      throw new Error('Invalid motion generated');
    }

    res.json({
      success: true,
      motion: motion,
      topic: topic,
      format: format,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating motion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate motion. Please try again.',
      fallback: true
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiAvailable: !!model,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate-motion`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
});
