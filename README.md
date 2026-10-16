# ShelfScribe

**Local AI Listing Writer for Etsy/EBay Sellers** — generates complete, ready-to-post product listings from a few photos and keywords, running 100% locally on open-weight AI models.

Built for Hacktoberfest 2026 Week 2: **Side Hustle** — something a real seller would actually pay for.

## Why This Exists

Etsy sellers spend hours writing titles, descriptions, tags, and researching prices — time that could be spent making more products or fulfilling orders. ShelfScribe automates that with a private, on-device AI that never uploads your product photos or designs to the cloud.

- **Core model:** `qwen3-vl:4b` (open-weight vision + language model) running via Ollama
- **Zero cloud API keys:** All inference happens on your laptop
- **GDPR/CCPA friendly:** Customer designs and product photos stay on-device
- **Cost to run:** $0 after download — the model is free and open-weight

This directly addresses the challenge theme:  
> _“Build something with open-weight models or open-source AI that someone would actually pay for.”_

An Etsy side-hustler would gladly pay $15–30/mo for a desktop app that turns phone photos into listings while keeping their IP private.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | FastAPI + Python 3.13 + Ollama client |
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **AI Model** | `qwen3-vl:4b` (4B parameters, vision + text, open-weight) |
| **Inference** | Ollama (local model server) |
| **License** | MIT |

## Local Setup

### Prerequisites
- [Ollama](https://ollama.com/download) (tested on v0.18.1+)
- Node.js 18+ & npm
- Python 3.10+

### Installation
```bash
# 1. Clone repo
git clone https://github.com/RameezHiro/ShelfScribe.git
cd ShelfScribe

# 2. Pull the vision model (first time only)
ollama pull qwen3-vl:4b

# 3. Start Ollama server (in separate terminal)
ollama serve

# 4. Install backend deps
cd backend
pip install -r requirements.txt

# 5. Install frontend deps
cd ../frontend
npm install

# 6. Start backend (separate terminal)
cd ../backend
uvicorn main:app --reload --port 8000

# 7. Start frontend (separate terminal)
cd ../frontend
npm run dev

# 8. Open http://localhost:5173 in your browser
```

## Usage
1. Upload 1-5 photos of your product (clear, well-lit shots work best)
2. Optional: Add keywords (e.g., "boho, ceramic, mug, gift for her")
3. Optional: Specify product type (e.g., "jewelry, home decor, clothing")
4. Click **Generate Listing**
5. Copy the title, description, tags, and price range straight into Etsy

## How Open Innovation Matters
- **Privacy:** Product designs and customer data never leave your laptop — critical for makers selling unique, handmade goods.
- **Cost:** Zero per-use fees; the open-weight model is free to run indefinitely.
- **Control:** Fine-tune or swap models anytime; you're not locked into a vendor's pricing or API changes.
- **Transparency:** You can inspect and modify the inference code — unlike closed APIs.

## Hacktoberfest Submission
- **Required tag:** `#hf26challenge`
- **Partner categories targeting:** Best Use of Gemma (via Ollama's open-weight model ecosystem), Best Use of Render (live demo)
- **Submission:** A new project built entirely during Oct 12–18, 2026 window

## License
MIT License — see [LICENSE](LICENSE) file.

Built with 💙 by RameezHiro for Hacktoberfest 2026.