#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'readline';

// ============================================
// CONFIGURATION - Get free API key from:
// https://console.groq.com/keys
// ============================================
const CONFIG = {
    provider: 'groq', // 'groq' (free) or 'ollama' (local)
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqModel: 'llama-3.3-70b-versatile', // Free & powerful!
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.2:3b',
};

// System prompt for Linux command expertise
const SYSTEM_PROMPT = `You are a helpful Linux command helper. You help people understand terminal commands.

IMPORTANT RULES:
1. Use VERY SIMPLE ENGLISH - like talking to a friend
2. No big/difficult words - keep it super easy to read
3. Short sentences only
4. Show the command first, then explain

HOW TO ANSWER:
\`\`\`bash
<command here>
\`\`\`

What it does: <explain in 1-2 simple lines>

Each part:
- \`-flag\` = what this does (simple words)

Example if needed.

WARNING for dangerous commands like rm -rf.

Remember: Simple words, short answers, easy to understand!`;

// Chat history for context
let chatHistory = [];

// ============================================
// GROQ API (FREE Cloud)
// ============================================
async function askGroq(userMessage) {
    chatHistory.push({ role: 'user', content: userMessage });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.groqApiKey}`,
        },
        body: JSON.stringify({
            model: CONFIG.groqModel,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...chatHistory,
            ],
            stream: true,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        if (response.status === 401) {
            throw new Error('Invalid API key! Get one free at: https://console.groq.com/keys');
        }
        throw new Error(`Groq error: ${response.status} - ${err}`);
    }

    return response.body;
}

// ============================================
// OLLAMA API (Local)
// ============================================
async function askOllama(userMessage) {
    chatHistory.push({ role: 'user', content: userMessage });

    const response = await fetch(`${CONFIG.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: CONFIG.ollamaModel,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...chatHistory,
            ],
            stream: true,
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} - Is Ollama running?`);
    }

    return response.body;
}

// Stream Groq response (OpenAI format)
async function streamGroqResponse(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    process.stdout.write(chalk.cyan('\n'));

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
                const json = JSON.parse(data);
                const text = json.choices?.[0]?.delta?.content || '';
                if (text) {
                    fullResponse += text;
                    if (text.includes('```')) {
                        process.stdout.write(chalk.yellow(text));
                    } else {
                        process.stdout.write(chalk.white(text));
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }

    process.stdout.write('\n\n');
    chatHistory.push({ role: 'assistant', content: fullResponse });

    if (chatHistory.length > 10) {
        chatHistory = chatHistory.slice(-10);
    }
}

// Stream Ollama response
async function streamOllamaResponse(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    process.stdout.write(chalk.cyan('\n'));

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
            try {
                const json = JSON.parse(line);
                if (json.message?.content) {
                    const text = json.message.content;
                    fullResponse += text;
                    if (text.includes('```')) {
                        process.stdout.write(chalk.yellow(text));
                    } else {
                        process.stdout.write(chalk.white(text));
                    }
                }
            } catch (e) { }
        }
    }

    process.stdout.write('\n\n');
    chatHistory.push({ role: 'assistant', content: fullResponse });

    if (chatHistory.length > 10) {
        chatHistory = chatHistory.slice(-10);
    }
}

// Unified ask function
async function ask(userMessage) {
    if (CONFIG.provider === 'groq') {
        const body = await askGroq(userMessage);
        await streamGroqResponse(body);
    } else {
        const body = await askOllama(userMessage);
        await streamOllamaResponse(body);
    }
}

// Check provider status
async function checkProvider() {
    if (CONFIG.provider === 'groq') {
        if (CONFIG.groqApiKey === 'YOUR_API_KEY_HERE' || !CONFIG.groqApiKey) {
            console.log(chalk.red('\n✖ Groq API key not set!'));
            console.log(chalk.gray('\n1. Get free key: https://console.groq.com/keys'));
            console.log(chalk.gray('2. Set it: export GROQ_API_KEY="your-key-here"'));
            console.log(chalk.gray('   Or edit index.js and paste your key\n'));
            return false;
        }
        return true;
    } else {
        // Check Ollama
        try {
            const res = await fetch(`${CONFIG.ollamaUrl}/api/tags`);
            return res.ok;
        } catch {
            console.log(chalk.red('\n✖ Ollama is not running!'));
            console.log(chalk.gray('Start it with: ollama serve\n'));
            return false;
        }
    }
}

// One-shot mode
async function oneShot(question) {
    const spinner = ora({ text: 'Thinking...', color: 'cyan' }).start();

    try {
        if (CONFIG.provider === 'groq') {
            const body = await askGroq(question);
            spinner.stop();
            await streamGroqResponse(body);
        } else {
            const body = await askOllama(question);
            spinner.stop();
            await streamOllamaResponse(body);
        }
    } catch (err) {
        spinner.fail(err.message);
        process.exit(1);
    }
}

// Interactive mode
async function interactiveMode() {
    const providerName = CONFIG.provider === 'groq' ? 'Groq (cloud)' : 'Ollama (local)';
    const modelName = CONFIG.provider === 'groq' ? CONFIG.groqModel : CONFIG.ollamaModel;

    console.log(chalk.bold.green('\n🐧 Linux Helper'));
    console.log(chalk.gray(`Provider: ${providerName} | Model: ${modelName}`));
    console.log(chalk.gray('Type "exit" to quit | "clear" to reset\n'));

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const prompt = () => {
        rl.question(chalk.bold.blue('You: '), async (input) => {
            const trimmed = input.trim();

            if (!trimmed) {
                prompt();
                return;
            }

            if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
                console.log(chalk.gray('\nBye! 👋\n'));
                rl.close();
                process.exit(0);
            }

            if (trimmed.toLowerCase() === 'clear') {
                chatHistory = [];
                console.log(chalk.gray('\n✓ History cleared\n'));
                prompt();
                return;
            }

            const spinner = ora({ text: 'Thinking...', color: 'cyan' }).start();

            try {
                if (CONFIG.provider === 'groq') {
                    const body = await askGroq(trimmed);
                    spinner.stop();
                    await streamGroqResponse(body);
                } else {
                    const body = await askOllama(trimmed);
                    spinner.stop();
                    await streamOllamaResponse(body);
                }
            } catch (err) {
                spinner.fail(err.message);
            }

            prompt();
        });
    };

    prompt();
}

// Main
async function main() {
    const args = process.argv.slice(2);

    if (!(await checkProvider())) {
        process.exit(1);
    }

    if (args.length > 0) {
        await oneShot(args.join(' '));
    } else {
        await interactiveMode();
    }
}

main().catch((err) => {
    console.error(chalk.red('Error:'), err.message);
    process.exit(1);
});
