"""
Story Generator API

A FastAPI application that generates children's stories with accompanying images.
The API creates 8-part stories with magical themes suitable for children aged
4-12, using Gemini for story text and Pollinations for illustrations.

Features:
- Story generation using Gemini 2.5 Flash
- Image URLs using Pollinations
- Fallback to placeholder images when image URLs cannot be created
- CORS enabled for frontend integration
- Comprehensive error handling and logging
"""

import os
import re
import base64
import json
import hashlib
import logging
from typing import List
from urllib.parse import urlencode, quote
from urllib.request import Request, urlopen

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s -   %(levelname)s   -   %(message)s'
)
logger = logging.getLogger(__name__)

# Suppress verbose Google client logs
logging.getLogger("root").setLevel(logging.WARNING)

# Initialize FastAPI app
app = FastAPI(title="Story Generator API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY environment variable is required")
    raise ValueError("GEMINI_API_KEY environment variable is required")

client = genai.Client(api_key=GEMINI_API_KEY)
logger.info("Gemini client initialized successfully")

POLLINATIONS_IMAGE_BASE_URLS = [
    url.strip().rstrip("/")
    for url in os.getenv(
        "POLLINATIONS_IMAGE_BASE_URLS",
        "https://image.pollinations.ai/prompt,https://gen.pollinations.ai/image"
    ).split(",")
    if url.strip()
]
BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "http://localhost:8000")

# Pydantic models
class StoryRequest(BaseModel):
    """Request model for story generation"""
    prompt: str

class StoryPart(BaseModel):
    """Individual story part with text and image"""
    text: str
    image: str  # base64 encoded image

class StoryResponse(BaseModel):
    """Response model containing complete story with parts"""
    title: str
    parts: List[StoryPart]

# Utility functions
def parse_structured_story(parts_data: List[dict]) -> List[str]:
    """Parse the structured story into text parts"""
    return [part.get("content", "") for part in parts_data]

def create_placeholder_image(part_number: int) -> str:
    """Create a colorful placeholder image when image generation fails"""
    colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f']
    color = colors[part_number % len(colors)]
    
    svg = f'''
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad{part_number}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:{color};stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.6" />
            </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#grad{part_number})"/>
        <circle cx="200" cy="150" r="30" fill="#ffffff" opacity="0.7"/>
        <circle cx="150" cy="250" r="20" fill="#ffffff" opacity="0.5"/>
        <circle cx="250" cy="280" r="25" fill="#ffffff" opacity="0.6"/>
        <text x="200" y="350" font-family="Arial, sans-serif" font-size="18" fill="#333" text-anchor="middle" font-weight="bold">Story Part {part_number}</text>
    </svg>
    '''
    
    return f"data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}"

def clean_story_text(text: str) -> str:
    """Remove markdown and extra whitespace from generated story text."""
    return re.sub(r'\s+', ' ', re.sub(r'[#*]', '', text)).strip()

def generate_image_for_story_part(
    story_parts: List[str],
    story_theme: str,
    part_number: int,
) -> str:
    """Create a Pollinations image URL for one page in the story sequence."""
    part_index = part_number - 1
    current_scene = clean_story_text(story_parts[part_index])
    clean_theme = clean_story_text(story_theme)

    seed_source = f"{clean_theme}|{part_number}|{current_scene}"
    seed = int(hashlib.sha256(seed_source.encode("utf-8")).hexdigest()[:8], 16) % 2147483647

    image_prompt = (
        f"{clean_theme[:140]}. Page {part_number}: {current_scene[:220]}. "
        "storybook illustration, red-haired hero if present, dragons if present, bridge if present, "
        "dynamic action scene, colorful fantasy art, child friendly, no text"
    )
    query_params = urlencode({
        "prompt": image_prompt,
        "part": str(part_number),
        "seed": str(seed),
    })

    logger.info(f"Using proxied Pollinations image URL for part {part_number}")
    return f"{BACKEND_PUBLIC_URL}/image?{query_params}"

def build_pollinations_image_urls(prompt: str, seed: int) -> List[str]:
    """Build upstream Pollinations URL candidates."""
    query_params = urlencode({
        "width": "768",
        "height": "768",
        "model": "flux",
        "seed": str(seed),
    })

    return [
        f"{base_url}/{quote(prompt)}?{query_params}"
        for base_url in POLLINATIONS_IMAGE_BASE_URLS
    ]

# API endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Story Generator API is running!"}

@app.get("/image")
async def proxy_pollinations_image(prompt: str, seed: int, part: int = 1):
    """Fetch a Pollinations image and return a real image response to the frontend."""
    for upstream_url in build_pollinations_image_urls(prompt, seed):
        try:
            logger.info(f"Fetching Pollinations image for part {part}")
            request = Request(
                upstream_url,
                headers={
                    "User-Agent": "MagicalStoryGenerator/1.0",
                    "Accept": "image/*",
                },
            )
            with urlopen(request, timeout=60) as upstream_response:
                content_type = upstream_response.headers.get("Content-Type", "image/jpeg")
                image_bytes = upstream_response.read()

            if content_type.startswith("image/") and image_bytes:
                return Response(content=image_bytes, media_type=content_type)

            logger.error(f"Pollinations returned non-image response: {content_type}")
        except Exception as e:
            logger.error(f"Pollinations image fetch failed for part {part}: {e}")

    return _placeholder_response(part)

def _placeholder_response(part_number: int) -> Response:
    """Return the SVG placeholder as an HTTP image response."""
    placeholder = create_placeholder_image(part_number)
    svg_base64 = placeholder.split(",", 1)[1]
    return Response(content=base64.b64decode(svg_base64), media_type="image/svg+xml")

@app.post("/generate", response_model=StoryResponse)
async def generate_story(request: StoryRequest):
    """Generate a story with images based on the user prompt"""
    
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    try:
        logger.info(f"Generating story for prompt: {request.prompt[:50]}")
        
        # Generate story content
        story_json = await _generate_story_content(request.prompt)
        title = story_json.get("title", "A Magical Adventure")
        parts_data = story_json.get("parts", [])
        
        if not parts_data:
            raise ValueError("No story parts generated")
        
        # Ensure exactly 8 parts
        parts_data = _ensure_eight_parts(parts_data)
        story_parts = parse_structured_story(parts_data)
        
        logger.info(f"Generated story: {title} with {len(story_parts)} parts")
        
        # Generate images for each part
        story_response_parts = await _generate_story_images(story_parts, request.prompt)
        
        return StoryResponse(title=title, parts=story_response_parts)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error generating story: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate story: {str(e)}")

async def _generate_story_content(prompt: str) -> dict:
    """Generate story content using Gemini API"""
    system_instruction = """
    You are a creative children's story writer. Create engaging, magical, and age-appropriate stories 
    that are perfect for children aged 4-12. 
    
    Requirements:
    1. Create exactly 8 parts for the story
    2. Each part should be 2-4 sentences long
    3. Use vivid, descriptive language that can be easily illustrated
    4. Include magical elements and positive themes
    5. Ensure a clear story arc with beginning, middle, and end
    6. Make each part engaging and suitable for children
    7. Use markdown formatting: ## for headers, **text** for bold emphasis
    8. Each part should flow naturally to the next
    
    The story should have:
    - Interesting characters and adventures
    - Educational and inspiring themes
    - Vivid descriptions perfect for illustration
    - A satisfying conclusion
    """
    
    story_prompt = f"""
    Create a magical children's story based on this idea: {prompt}
    
    CRITICAL: Return ONLY valid JSON. Do NOT use string concatenation with + operators.
    
    Return your response as a valid JSON object with this exact structure:
    {{
        "title": "Story Title Here",
        "parts": [
            {{"part_number": 1, "content": "## Part 1 Title\\n\\nStory content with **bold text** here. Keep each content as one continuous string without + operators."}},
            {{"part_number": 2, "content": "## Part 2 Title\\n\\nMore story content in one string..."}},
            {{"part_number": 3, "content": "## Part 3 Title\\n\\nContinue the story..."}},
            {{"part_number": 4, "content": "## Part 4 Title\\n\\nMiddle of the adventure..."}},
            {{"part_number": 5, "content": "## Part 5 Title\\n\\nBuilding to climax..."}},
            {{"part_number": 6, "content": "## Part 6 Title\\n\\nThe climax moment..."}},
            {{"part_number": 7, "content": "## Part 7 Title\\n\\nResolution begins..."}},
            {{"part_number": 8, "content": "## Part 8 Title\\n\\nHappy ending conclusion..."}}
        ]
    }}
    
    Requirements:
    - Create exactly 8 parts as shown above
    - Each content must be ONE continuous string (no + concatenation)
    - Each part should be 2-4 sentences
    - Use markdown: ## for headers, **text** for bold
    - Make it engaging for children aged 4-12
    - Each part should be descriptive for illustration
    - Return ONLY the JSON, no extra text or markdown formatting
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[story_prompt],
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            temperature=0.8,
            max_output_tokens=2000
        )
    )
    
    return _parse_story_response(response)

def _parse_story_response(response) -> dict:
    """Parse the Gemini response into structured story data"""
    try:
        response_text = _clean_json_response(response.text)
        logger.debug(f"Cleaned response: {response_text[:200]}")

        return json.loads(response_text)
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        logger.warning(f"Raw response preview: {response.text[:500]}")
        
        # Fallback: create a story from the raw text
        logger.info("Falling back to text parsing")
        paragraphs = [p.strip() for p in response.text.split('\n\n') if p.strip()]
        
        # Create fallback story structure
        fallback_parts = []
        for i in range(8):
            if i < len(paragraphs):
                content = paragraphs[i]
            else:
                content = f"## Part {i+1}\n\nThe adventure continues with magical surprises!"
            
            fallback_parts.append({
                "part_number": i + 1,
                "content": content
            })
        
        return {
            "title": "A Magical Adventure",
            "parts": fallback_parts
        }
    
    except Exception as e:
        logger.error(f"Unexpected error parsing response: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse story structure: {str(e)}")

def _clean_json_response(response_text: str) -> str:
    """Clean common model formatting issues before JSON parsing."""
    response_text = response_text.strip()

    if response_text.startswith('```json'):
        response_text = response_text.replace('```json', '', 1).strip()
    if response_text.startswith('```'):
        response_text = response_text.replace('```', '', 1).strip()
    if response_text.endswith('```'):
        response_text = response_text[:-3].strip()

    json_start = response_text.find('{')
    json_end = response_text.rfind('}')
    if json_start != -1 and json_end != -1:
        response_text = response_text[json_start:json_end + 1]

    # Fix JavaScript-style string concatenation that Gemini sometimes generates.
    response_text = re.sub(r'"\s*\+\s*"', '', response_text)
    response_text = re.sub(r'"\s*\+\s*"\n', '', response_text)

    # Fix trailing commas before closing arrays/objects.
    response_text = re.sub(r',\s*([}\]])', r'\1', response_text)

    # Fix occasional unquoted object keys, e.g. {title: "..."}.
    response_text = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', response_text)

    return response_text

def _ensure_eight_parts(parts_data: List[dict]) -> List[dict]:
    """Ensure the story has exactly 8 parts"""
    if len(parts_data) == 8:
        return parts_data
    
    logger.warning(f"Generated {len(parts_data)} parts instead of 8")
    
    if len(parts_data) < 8:
        # Add additional parts
        while len(parts_data) < 8:
            part_num = len(parts_data) + 1
            new_part = {
                "part_number": part_num,
                "content": f"## Part {part_num}\n\nAnd so the **magical adventure** continued with even more wonderful surprises ahead!"
            }
            parts_data.append(new_part)
    else:
        # Trim to 8 parts
        parts_data = parts_data[:8]
    
    return parts_data

async def _generate_story_images(story_parts: List[str], prompt: str) -> List[StoryPart]:
    """Generate images for each story part"""
    story_response_parts = []
    max_image_calls = min(8, 15 - 1)  # Reserve 1 call for story generation
    
    for i, part_text in enumerate(story_parts[:max_image_calls]):
        try:
            image_data = generate_image_for_story_part(story_parts, prompt, i+1)
        except Exception as e:
            logger.error(f"Error creating image URL for part {i+1}: {e}")
            image_data = create_placeholder_image(i+1)
        
        story_response_parts.append(StoryPart(
            text=part_text,
            image=image_data
        ))
    
    images_generated = sum(1 for part in story_response_parts if not part.image.startswith('data:image/svg+xml'))
    placeholders_used = len(story_response_parts) - images_generated
    
    logger.info(f"Generated {len(story_response_parts)} story parts")
    logger.info(f"Real images: {images_generated}, Placeholders: {placeholders_used}")
    
    return story_response_parts

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
