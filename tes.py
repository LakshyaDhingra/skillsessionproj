from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import os
from dotenv import load_dotenv
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

prompt = (
    "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme. Also, give a 1-2 sentence textual description of the image."
)

response = client.models.generate_content(
    model="gemini-2.0-flash-preview-image-generation",
    contents=[prompt],
)

for part in response.candidates[0].content.parts:
    if part.text is not None:
        print(part.text)
    elif hasattr(part, "inline_data") and part.inline_data is not None:
        image = Image.open(BytesIO(part.inline_data.data))
        image.save("generated_image.png")
        print("Image saved as generated_image.png")
