import os
import json
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
import uvicorn
import ollama
from typing import List

app = FastAPI(title="ShelfScribe API")

@app.post("/api/generate-listing")
async def generate_listing(
    files: List[UploadFile] = File(...),
    keywords: str = Form(None),
    product_type: str = Form(None)
):
    """
    Accept product photos + optional keywords/product type and return a full Etsy listing.
    Uses local open-weight vision model (qwen3-vl:4b) via Ollama.
    """
    try:
        # Read and encode images
        images = []
        for f in files:
            content = await f.read()
            # Ollama expects base64
            import base64
            b64 = base64.b64encode(content).decode('utf-8')
            images.append(b64)

        # Build prompt
        prompt_parts = [
            "You are an expert Etsy listing writer. Given the following product photos,",
            "generate a complete, polished Etsy listing including:",
            "- A catchy, SEO-friendly title (under 140 characters)",
            "- A detailed description that highlights materials, dimensions, use cases, and story",
            "- 13 relevant Etsy tags (comma-separated)",
            "- A suggested price range in USD (based on similar handmade items)",
            "",
            "Make the listing warm, professional, and optimized for Etsy search.",
            "If the user provided keywords or product type, incorporate them naturally.",
            "",
            "Format your response as JSON with keys: title, description, tags, price_range.",
            "",
        ]
        if keywords:
            prompt_parts.append(f"User-provided keywords: {keywords}")
        if product_type:
            prompt_parts.append(f"Product type: {product_type}")
        prompt_parts.append("\nPhotos provided: yes")

        prompt = "\n".join(prompt_parts)

        # Call Ollama
        response = ollama.generate(
            model="qwen3-vl:4b",
            prompt=prompt,
            images=images,
            stream=False
        )

        # Try to parse JSON from response
        raw = response.get('response', '{}')
        # Find JSON object in the response
        import re
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        if json_match:
            try:
                listing_data = json.loads(json_match.group(0))
            except json.JSONDecodeError:
                listing_data = {}
        else:
            listing_data = {}

        # Ensure required keys exist
        listing_data.setdefault("title", "Handmade Product")
        listing_data.setdefault("description", "Beautifully crafted item made with care.")
        listing_data.setdefault("tags", "handmade, gift, unique, artisan, craft")
        listing_data.setdefault("price_range", "$20 - $50")

        return JSONResponse(content=listing_data)

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
