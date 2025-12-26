# Zerclix Technologies AI Chat Integration

This project integrates an AI-powered chat support system that can answer questions about the company, services, team, and projects. The system connects to OpenAI's API to provide intelligent responses.

## Setup Instructions

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini
   PORT=3000
   ```

4. **Start the Server**
   ```bash
   npm start
   # or
   node server.js
   ```

## Features

- **AI-Powered Support Chat**: Available on all pages (index.html, project.html, team.html)
- **Company Knowledge**: Answers questions about Zerclix Technologies, services, team, and projects
- **Cross-Page Functionality**: Chat works consistently across all pages
- **Fallback System**: If backend is not running, falls back to simulated responses
- **Real-time Interaction**: Shows typing indicators and smooth responses

## Files Included

- `server.js` - Backend server with OpenAI integration
- `package.json` - Project dependencies (express, openai)
- `.env` - Environment variables (API keys)
- Updated JavaScript files (main.js, team.js, project.js) - Frontend AI integration
- Updated HTML files (index.html, project.html, team.html) - Chat interface
- `start.js` - Alternative startup script

## How It Works

1. When a user sends a message in the chat widget, it's sent to the backend API
2. The backend processes the message using OpenAI's API
3. The AI response is sent back to the frontend
4. If the backend is not available, the system falls back to simulated company responses

## Customization

You can customize the company responses by modifying the `generateCompanyResponse` function in the JavaScript files. This function is used as a fallback when the AI service is unavailable.