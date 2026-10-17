# Use Python 3.13 slim image
FROM python:3.13-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    zstd \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/ ./backend/
WORKDIR /app/backend

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Ollama (for local AI model)
RUN curl -fsSL https://ollama.com/install.sh | sh

# Expose port
EXPOSE 8000

# Copy frontend files and build
WORKDIR /app
COPY frontend/ ./frontend/

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Go back to backend directory to run the app
WORKDIR /app/backend

# Start Ollama service and then start the FastAPI server
CMD ["sh", "-c", "ollama serve & uvicorn main:app --host 0.0.0.0 --port 8000"]