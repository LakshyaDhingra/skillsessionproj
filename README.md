# 🌟 Magical Story Generator

A full-stack application that generates beautiful, illustrated children's stories using AI. Built with Next.js frontend and FastAPI backend, powered by Google's Gemini API.

## ✨ Features

- 🎨 **AI Story Generation**: Creates engaging, age-appropriate stories using Gemini 2.5 Flash with structured output
- 🖼️ **AI Image Generation**: Generates beautiful illustrations for each story part with enhanced prompts
- 📚 **Interactive Story Reader**: Beautiful book-like interface with page turning animations
- 📝 **Markdown Rendering**: Support for headers (##) and bold text (**) in stories
- 🎭 **Magical UI**: Animated, child-friendly interface with sparkles and floating elements
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- ⚡ **Optimized Performance**: Exactly 8 story parts, max 15 API calls, better error handling

## 🏗️ Project Structure

```
bootcamp_project/
├── frontend/          # Next.js React frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/ui/    # Reusable UI components
│   │   └── lib/             # Utility functions
│   └── package.json
├── backend/           # FastAPI backend
│   ├── main.py       # Main API server
│   ├── start.py      # Startup script with checks
│   ├── requirements.txt
│   └── .env          # Environment variables
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here

# Start the backend server
python start.py
```

The backend will start on `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3001` (or 3000 if available)

## 🎯 Usage

1. **Open the application** in your browser at `http://localhost:3001`
2. **Enter a story prompt** like "A brave princess who saves dragons"
3. **Click "Generate My Story!"** and wait for the magic to happen
4. **Enjoy your story** with beautiful AI-generated illustrations
5. **Navigate through pages** using the arrow buttons or page indicators

## 🛠️ API Endpoints

### POST /generate

Generates a complete story with images based on a prompt.

**Request:**
```json
{
  "prompt": "A magical adventure in space"
}
```

**Response:**
```json
{
  "title": "The Cosmic Adventure",
  "parts": [
    {
      "text": "Once upon a time...",
      "image": "data:image/png;base64,..."
    }
  ]
}
```

## 🎨 UI Components

The frontend includes custom UI components:

- **Button**: Multiple variants with animations
- **Input**: Styled input fields with focus states  
- **Card**: Container components with backdrop effects

All components are built with TypeScript and Tailwind CSS for consistency and maintainability.

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run linting
```

### Backend Development

```bash
cd backend
python start.py  # Start with checks
# OR
python main.py   # Direct start
# OR
uvicorn main:app --reload  # With auto-reload
```

### API Documentation

When the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## 🌟 Story Generation Process

1. **User Input**: User provides a creative prompt
2. **Structured Generation**: Gemini AI creates a magical children's story with exactly 8 parts using JSON structured output
3. **Content Formatting**: Each part includes markdown formatting for headers and bold text
4. **Image Generation**: Each part gets a beautiful AI-generated illustration with enhanced prompts
5. **Story Presentation**: Interactive book interface displays the complete story with proper formatting

## 🎭 Animations & Effects

The frontend features magical animations:

- ✨ Sparkle animations on icons
- 🎈 Floating effects for decorative elements
- 📖 Page turning animations
- 🌟 Magical entrance animations
- 💫 Hover effects on interactive elements

## 🔐 Environment Variables

### Backend (.env)

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🐛 Troubleshooting

### Backend Issues

- **"GEMINI_API_KEY not set"**: Make sure you've created a `.env` file with your API key
- **"Module not found"**: Run `pip install -r requirements.txt`
- **API errors**: Check your Gemini API key is valid and has sufficient quota

### Frontend Issues

- **Build errors**: Make sure all dependencies are installed with `npm install`
- **API connection errors**: Ensure the backend is running on `http://localhost:8000`
- **TypeScript errors**: Try deleting `.next` folder and rebuilding

## 📚 Technology Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Custom UI Components** - Reusable components

### Backend
- **FastAPI** - Python web framework
- **Google Gemini API** - AI text and image generation
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## 🎉 Features in Detail

### Story Generation
- **Structured Output**: Exactly 8 parts per story using JSON schema
- **Markdown Support**: Headers (##) and bold text (**) for better formatting
- **Child-appropriate content** with positive themes
- **Consistent structure** with clear beginning, middle, and end
- **Vivid descriptions** perfect for illustration
- **Educational and inspiring** themes

### Image Generation
- **Enhanced prompts** for more relevant illustrations
- **Colorful placeholders** when image generation fails
- **Child-friendly art style** with magical themes
- **Optimized display** with proper aspect ratios
- **Lazy loading** for better performance

### User Experience
- Intuitive, magical interface
- Responsive design for all devices
- Smooth animations and transitions
- Error handling with helpful messages
- Loading states with progress indication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Happy storytelling! ✨📚🌟**
