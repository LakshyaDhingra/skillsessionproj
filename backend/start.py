#!/usr/bin/env python3
"""
Simple startup script for the Story Generator Backend
"""

import os
import sys
from pathlib import Path

def check_requirements():
    """Check if all requirements are installed"""
    try:
        import fastapi
        import uvicorn
        import google.genai
        from PIL import Image
        from dotenv import load_dotenv
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_env():
    """Check if environment variables are set"""
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_actual_gemini_api_key_here":
        print("❌ GEMINI_API_KEY not set in .env file")
        print("Please:")
        print("1. Create a .env file in the backend directory")
        print("2. Add: GEMINI_API_KEY=your_actual_api_key")
        print("3. Get your API key from: https://makersuite.google.com/app/apikey")
        return False
    
    print("✅ Environment variables configured")
    return True

def main():
    print("🚀 Starting Story Generator Backend...")
    
    if not check_requirements():
        sys.exit(1)
    
    if not check_env():
        sys.exit(1)
    
    print("✅ All checks passed!")
    print("🌟 Starting server on http://localhost:8000")
    print("📚 API docs available at http://localhost:8000/docs")
    
    # Import and run the app
    import uvicorn
    from main import app
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
