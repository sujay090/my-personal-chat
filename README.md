# 🐧 Linux Helper - Personal CLI Chatbot

A fast, local CLI chatbot for Linux/Unix command help. Runs entirely on your machine using Ollama.

## Quick Start

### 1. Install Ollama (if not installed)
```bash
brew install ollama
```

### 2. Start Ollama & Pull Model
```bash
# Start Ollama service
ollama serve

# In another terminal, pull the model (one time only)
ollama pull llama3.2:3b
```

### 3. Install & Run
```bash
# Install dependencies
npm install

# Run interactive mode
npm start

# Or quick question
node index.js "how to find large files"
```

### 4. Global Access (Optional)
```bash
npm link

# Now use from anywhere:
ask "how to see disk usage"
```

## Usage

**Interactive Mode:**
```bash
npm start
# or after npm link:
ask
```

**Quick Question:**
```bash
node index.js "how to grep recursively"
# or after npm link:
ask "how to list all docker containers"
```

## Commands in Chat
- `exit` or `quit` - Exit the chatbot
- `clear` - Clear conversation history

## Change Model

Edit `CONFIG.model` in `index.js`. Good options for M4 16GB:

| Model | Speed | Quality | RAM |
|-------|-------|---------|-----|
| `llama3.2:3b` | ⚡⚡⚡ | Good | ~4GB |
| `llama3.2:8b` | ⚡⚡ | Better | ~6GB |
| `mistral:7b` | ⚡⚡ | Great | ~5GB |
| `codellama:7b` | ⚡⚡ | Best for code | ~5GB |

Pull new model: `ollama pull <model-name>`

## Examples

```
You: how to find files modified in last 24 hours

🤖:
```bash
find . -mtime -1
```
Finds files modified within the last 24 hours in current directory.
- `-mtime -1` = modified less than 1 day ago
- Add `-type f` for files only
```

---

Built for fast terminal workflow 🚀
