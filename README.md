# 🐧 Linux Helper - Personal CLI Chatbot

A fast CLI chatbot for Linux/Unix command help. Uses **Groq API** (free, cloud-based) - no local resources needed!

## ⚡ Quick Start

### 1. Get Free API Key
Go to [console.groq.com/keys](https://console.groq.com/keys) → Sign up → Create API Key

### 2. Install
```bash
npm install
```

### 3. Set API Key
```bash
export GROQ_API_KEY="your-key-here"
```

### 4. Run
```bash
# Interactive mode
npm start

# Quick question
node index.js "how to find large files"
```

## 🌐 Global Access (Optional)

Run from anywhere in terminal:
```bash
npm link

# Now use:
ask "how to list docker containers"
ask   # opens interactive mode
```

## 💡 Usage Examples

```bash
ask "how to delete a folder"
ask "what is grep"
ask "find files larger than 100mb"
ask "show disk usage"
```

## ⚙️ Make API Key Permanent

Add to your shell config:
```bash
# For zsh (default on Mac)
echo 'export GROQ_API_KEY="your-key"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export GROQ_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc
```

## 🔧 Commands in Chat

| Command | What it does |
|---------|--------------|
| `exit` or `quit` | Close chatbot |
| `clear` | Reset chat history |

## 📝 Features

- ✅ **Free** - Uses Groq's free API
- ✅ **Fast** - Cloud-based, no local resources
- ✅ **Simple answers** - Easy to understand English
- ✅ **Streaming** - See answers as they come
- ✅ **Context** - Remembers your previous questions

---

Built for fast terminal workflow 🚀
