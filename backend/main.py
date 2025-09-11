from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import os
import re
import base64
import json
from dotenv import load_dotenv
from typing import List, Dict, Optional

# Load environment variables
load_dotenv()

app = FastAPI(title="Story Generator API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")

client = genai.Client(api_key=GEMINI_API_KEY)

class StoryRequest(BaseModel):
    prompt: str

class StoryPart(BaseModel):
    text: str
    image: str  # base64 encoded image

class StoryResponse(BaseModel):
    title: str
    parts: List[StoryPart]

# Pydantic models for structured story generation (for documentation)
class GeneratedStoryPart(BaseModel):
    part_number: int
    content: str

class GeneratedStory(BaseModel):
    title: str
    parts: List[GeneratedStoryPart]

def parse_structured_story(parts_data: List[dict]) -> List[str]:
    """Parse the structured story into text parts"""
    return [part.get("content", "") for part in parts_data]

def generate_image_for_text(text: str, story_theme: str, part_number: int) -> str:
    """Generate an image based on the story text"""
    # Create a more descriptive prompt for image generation
    # Remove markdown formatting for image generation
    clean_text = re.sub(r'[#*]', '', text).strip()
    
    image_prompt = f"""
    Create a beautiful, child-friendly illustration for part {part_number} of a children's story about {story_theme}.
    
    Scene description: {clean_text[:300]}
    
    Style requirements:
    - Colorful and magical
    - Suitable for children aged 4-12
    - Warm and inviting atmosphere
    - Digital art style with soft lighting
    - Vibrant, cheerful colors
    - High quality illustration
    - Storybook illustration style
    
    Make sure the image clearly represents the key elements and mood of this story part.
    
    Please also provide a brief description of the generated image.
    """
    
    try:
        print(f"🎨 Generating image for part {part_number}...")
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents=[image_prompt],
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
                temperature=0.7  # Slightly more consistent but still creative
            )
        )
        
        if response.candidates and len(response.candidates) > 0:
            image_found = False
            text_description = ""
            
            for part in response.candidates[0].content.parts:
                if part.text is not None:
                    text_description = part.text
                    print(f"📝 Image description: {text_description[:100]}...")
                elif part.inline_data is not None:
                    # Convert image data to base64
                    image_data = base64.b64encode(part.inline_data.data).decode('utf-8')
                    print(f"✅ Successfully generated image for part {part_number}")
                    image_found = True
                    return f"data:image/png;base64,{image_data}"
            
            if not image_found:
                print(f"⚠️ No image data found in response for part {part_number}")
                return create_placeholder_image(part_number)
        
        print(f"No image data found in response for part {part_number}")
        return create_placeholder_image(part_number)
        
    except Exception as e:
        error_message = str(e)
        print(f"Error generating image for part {part_number}: {error_message}...")
        
        return create_placeholder_image(part_number)

def create_placeholder_image(part_number: int) -> str:
    """Create a colorful placeholder image"""
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

@app.get("/")
async def root():
    return {"message": "Story Generator API is running!"}

@app.post("/generate", response_model=StoryResponse)
async def generate_story(request: StoryRequest):
    """Generate a story with images based on the prompt"""
    
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    try:
        # System prompt for structured story generation
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
        
        # Generate story with structured output using a simpler approach
        story_prompt = f"""
        Create a magical children's story based on this idea: {request.prompt}
        
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
                temperature=0.8,  # Creative but consistent
                max_output_tokens=2000
            )
        )
        
        # Parse the structured response
        try:
            # Clean the response text to ensure it's valid JSON
            response_text = response.text.strip()
            
            # Sometimes the model wraps JSON in markdown code blocks
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '').strip()
            
            # Fix JavaScript-style string concatenation that Gemini sometimes generates
            # Replace patterns like "text" + "more text" with "textmore text"
            import re
            response_text = re.sub(r'"\s*\+\s*"', '', response_text)
            response_text = re.sub(r'"\s*\+\s*"\n', '', response_text)
            
            print(f"📝 Cleaned response: {response_text[:200]}...")
            
            story_json = json.loads(response_text)
            
            title = story_json.get("title", "A Magical Adventure")
            parts_data = story_json.get("parts", [])
            
            if not parts_data:
                raise ValueError("No story parts generated")
            
            # Ensure exactly 8 parts
            if len(parts_data) != 8:
                print(f"⚠️ Generated {len(parts_data)} parts instead of 8")
                # Pad or trim to exactly 8 parts
                if len(parts_data) < 8:
                    # Create additional parts based on the theme
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
            
            # Extract content from each part
            story_parts = parse_structured_story(parts_data)
            
            print(f"✅ Generated story: {title}")
            print(f"✅ Story parts: {len(story_parts)}")
            print(f"📝 First part preview: {story_parts[0][:100]}..." if story_parts else "")
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {e}")
            print(f"📝 Raw response: {response.text}")
            
            # Fallback: create a story from the raw text
            print("🔄 Falling back to text parsing...")
            title = "A Magical Adventure"
            # Split the text into 8 parts
            paragraphs = [p.strip() for p in response.text.split('\n\n') if p.strip()]
            
            if len(paragraphs) >= 8:
                story_parts = paragraphs[:8]
            else:
                # Duplicate paragraphs to reach 8 parts
                story_parts = []
                for i in range(8):
                    if i < len(paragraphs):
                        story_parts.append(paragraphs[i])
                    else:
                        story_parts.append(f"## Part {i+1}\n\nThe adventure continues with magical surprises!")
            
        except Exception as e:
            print(f"❌ Unexpected error parsing response: {e}")
            print(f"📝 Raw response: {response.text}")
            raise HTTPException(status_code=500, detail=f"Failed to parse story structure: {str(e)}")
        
        # Generate images for each part (max 15 API calls total - 1 for story + up to 8 for images)
        story_response_parts = []
        max_image_calls = min(8, 15 - 1)  # Reserve 1 call for story generation
        
        # Track quota exhaustion to avoid unnecessary API calls
        quota_exhausted = False
        
        for i, part_text in enumerate(story_parts[:max_image_calls]):
            if quota_exhausted:
                print(f"⚠️ Skipping image generation for part {i+1} due to quota exhaustion")
                image_data = create_placeholder_image(i+1)
            else:
                print(f"🎨 Generating image for part {i+1}/{len(story_parts)}")
                try:
                    image_data = generate_image_for_text(part_text, request.prompt, i+1)
                    
                    # Check if we got a placeholder (indicates quota exhaustion)
                    if image_data.startswith("data:image/svg+xml"):
                        quota_exhausted = True
                        
                except Exception as e:
                    error_message = str(e)
                    if "429" in error_message or "RESOURCE_EXHAUSTED" in error_message or "quota" in error_message.lower():
                        print(f"⚠️ API quota exhausted - will use placeholders for remaining images")
                        quota_exhausted = True
                    else:
                        print(f"❌ Error generating image for part {i+1}: {e}")
                    
                    image_data = create_placeholder_image(i+1)
            
            story_response_parts.append(StoryPart(
                text=part_text,
                image=image_data
            ))
        
        images_generated = sum(1 for part in story_response_parts if part.image.startswith('data:image/png'))
        placeholders_used = len(story_response_parts) - images_generated
        
        print(f"✅ Generated {len(story_response_parts)} story parts")
        print(f"🖼️ Real images: {images_generated}, Placeholders: {placeholders_used}")
        
        return StoryResponse(
            title=title,
            parts=story_response_parts
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error generating story: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate story: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
