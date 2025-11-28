/**
 * OpenAI-Compatible API Client
 * Uses Ollama's OpenAI-compatible endpoint at /v1
 * Also works with any OpenAI-compatible API (LM Studio, vLLM, etc.)
 */

class OllamaClient {
    constructor(baseUrl = 'http://localhost:11434') {
        this.baseUrl = this.normalizeUrl(baseUrl);
        this.abortController = null;
        this.apiKey = 'ollama'; // Default for Ollama (not actually used but required by some clients)
    }

    /**
     * Normalize the API URL
     * - Add http:// if missing
     * - Remove trailing slashes
     * - Ensure /v1 suffix for OpenAI compatibility
     */
    normalizeUrl(url) {
        if (!url) return 'http://localhost:11434/v1';
        
        let normalized = url.trim();
        
        // Add protocol if missing
        if (!normalized.match(/^https?:\/\//i)) {
            normalized = 'http://' + normalized;
        }
        
        // Remove trailing slashes
        normalized = normalized.replace(/\/+$/, '');
        
        // Remove existing /v1 or /api/v1 suffix (we'll add /v1 ourselves)
        normalized = normalized.replace(/\/(api\/v1|v1|api)\/?$/i, '');
        
        // Add /v1 for OpenAI compatibility
        normalized = normalized + '/v1';
        
        return normalized;
    }

    /**
     * Set the base URL for the API
     */
    setBaseUrl(url) {
        this.baseUrl = this.normalizeUrl(url);
        console.log('API base URL set to:', this.baseUrl);
    }

    /**
     * Set API key (for non-Ollama backends that require auth)
     */
    setApiKey(key) {
        this.apiKey = key || 'ollama';
    }

    /**
     * Check if the API is running and accessible
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch (error) {
            console.error('API connection check failed:', error);
            return false;
        }
    }

    /**
     * Get standard headers for API requests
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };
    }

    /**
     * Get list of available models (OpenAI format)
     */
    async getModels() {
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            
            // OpenAI format returns { data: [...models] }
            const models = data.data || data.models || [];
            
            // Normalize model format
            const normalizedModels = models.map(model => {
                const modelId = model.id || model.name;
                
                return {
                    name: modelId,
                    id: modelId,
                    size: model.size || 0,
                    owned_by: model.owned_by || 'local'
                };
            });
            
            return normalizedModels;
            
        } catch (error) {
            console.error('Failed to fetch models:', error);
            throw new Error(`Failed to connect to API at ${this.baseUrl}. Error: ${error.message}`);
        }
    }

    /**
     * Generate a theme using chat completions (OpenAI format)
     * Supports extracted colors from images
     */
    async generateTheme(prompt, options = {}) {
        const {
            model = 'llama3.2',
            temperature = 0.7,
            baseTheme = 'dark',
            contrast = 'normal',
            onProgress = null,
            extractedColors = null   // Colors extracted from image
        } = options;

        // Create abort controller for cancellation
        this.abortController = new AbortController();

        // Build the prompt using ThemeSchema
        const systemPrompt = ThemeSchema.generateSystemPrompt();
        
        // Build user prompt - include extracted colors if provided
        let userPrompt;
        if (extractedColors && extractedColors.length > 0) {
            userPrompt = this.buildColorPalettePrompt(prompt, extractedColors, { baseTheme, contrast });
        } else {
            userPrompt = ThemeSchema.generateSimplifiedPrompt(prompt, { baseTheme, contrast });
        }

        // Build messages array
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        // OpenAI chat completions format
        const requestBody = {
            model: model,
            messages: messages,
            temperature: temperature,
            max_tokens: 2048,
            stream: true,
            response_format: { type: 'json_object' }
        };

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(requestBody),
                signal: this.abortController.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            // Process streaming response (SSE format)
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            let totalTokens = 0;

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    // SSE format: "data: {...}" or "data: [DONE]"
                    if (!line.startsWith('data:')) continue;
                    
                    const data = line.slice(5).trim();
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        
                        // OpenAI streaming format
                        const delta = parsed.choices?.[0]?.delta;
                        if (delta?.content) {
                            fullResponse += delta.content;
                            totalTokens++;
                            
                            if (onProgress) {
                                onProgress({
                                    partial: fullResponse,
                                    tokens: totalTokens,
                                    done: false
                                });
                            }
                        }

                        // Check if generation is complete
                        if (parsed.choices?.[0]?.finish_reason) {
                            if (onProgress) {
                                onProgress({
                                    partial: fullResponse,
                                    tokens: totalTokens,
                                    done: true
                                });
                            }
                        }
                    } catch (parseError) {
                        // Skip malformed JSON chunks
                        console.warn('Skipping malformed chunk:', line);
                    }
                }
            }

            // Parse the complete response
            return this.parseThemeResponse(fullResponse, prompt, baseTheme);

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Generation cancelled');
            }
            throw error;
        }
    }

    /**
     * Non-streaming generation (fallback)
     */
    async generateThemeNonStreaming(prompt, options = {}) {
        const {
            model = 'llama3.2',
            temperature = 0.7,
            baseTheme = 'dark',
            contrast = 'normal',
            extractedColors = null
        } = options;

        this.abortController = new AbortController();

        const systemPrompt = ThemeSchema.generateSystemPrompt();
        
        // Build user prompt with color context if available
        let userPrompt;
        if (extractedColors && extractedColors.length > 0) {
            userPrompt = this.buildColorPalettePrompt(prompt, extractedColors, { baseTheme, contrast });
        } else {
            userPrompt = ThemeSchema.generateSimplifiedPrompt(prompt, { baseTheme, contrast });
        }

        // Build messages
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        const requestBody = {
            model: model,
            messages: messages,
            temperature: temperature,
            max_tokens: 2048,
            stream: false
        };

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(requestBody),
                signal: this.abortController.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';
            
            return this.parseThemeResponse(content, prompt, baseTheme);

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Generation cancelled');
            }
            throw error;
        }
    }

    /**
     * Parse the AI response into a valid theme object
     */
    parseThemeResponse(response, originalPrompt, baseTheme) {
        // Try to extract JSON from the response
        let jsonStr = response.trim();
        
        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
        
        // Remove any text before the first { and after the last }
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }
        
        // Clean up the JSON string - remove control characters but keep valid whitespace
        jsonStr = jsonStr
            .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // Remove control chars except \t, \n, \r
            .replace(/\r\n/g, '\n')  // Normalize line endings
            .replace(/\r/g, '\n');
        
        // Try multiple parsing approaches
        let parsed = null;
        let parseError = null;
        
        // Attempt 1: Parse as-is
        try {
            parsed = JSON.parse(jsonStr);
        } catch (e) {
            parseError = e;
        }
        
        // Attempt 2: Compact the JSON (remove extra whitespace)
        if (!parsed) {
            try {
                // Remove extra blank lines and normalize spacing
                const compacted = jsonStr
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .join('\n');
                parsed = JSON.parse(compacted);
            } catch (e) {
                // Keep original error
            }
        }
        
        // Attempt 3: Try to fix common JSON issues
        if (!parsed) {
            try {
                // Remove trailing commas before } or ]
                const fixed = jsonStr
                    .replace(/,(\s*[}\]])/g, '$1')
                    // Fix unquoted keys (basic attempt)
                    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
                parsed = JSON.parse(fixed);
            } catch (e) {
                // Keep original error
            }
        }
        
        if (!parsed) {
            console.error('Failed to parse theme response:', parseError);
            console.error('Raw response:', response);
            console.error('Cleaned JSON:', jsonStr);
            throw new Error('Failed to parse AI response as valid JSON. The model may not have generated valid theme data.');
        }

        // Check if it's a simplified palette format
        if (parsed.palette) {
            // Expand to full theme
            const themeName = parsed.name || this.generateThemeName(originalPrompt);
            const fullTheme = ThemeSchema.expandPaletteToTheme(
                parsed.palette,
                themeName,
                baseTheme
            );
            fullTheme.palette = parsed.palette; // Keep original palette for display
            return fullTheme;
        }
        
        // It's already a full theme
        if (!parsed.name) {
            parsed.name = this.generateThemeName(originalPrompt);
        }
        
        // Validate the theme
        const validation = ThemeSchema.validateTheme(parsed);
        if (!validation.valid) {
            console.warn('Theme validation warnings:', validation.errors);
        }

        return parsed;
    }

    /**
     * Generate a theme name from the prompt
     */
    generateThemeName(prompt) {
        // Extract key words from prompt
        const words = prompt.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2)
            .slice(0, 3);
        
        if (words.length === 0) {
            return 'Generated Theme';
        }

        // Capitalize each word
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Theme';
    }

    /**
     * Build a prompt that incorporates extracted colors from an image
     */
    buildColorPalettePrompt(textPrompt, extractedColors, options = {}) {
        const { baseTheme = 'dark', contrast = 'normal' } = options;
        
        // Ensure colors are clean hex strings (limit to 6 colors for shorter prompt)
        const cleanColors = extractedColors
            .slice(0, 6)
            .map(c => String(c).trim())
            .filter(c => /^#[0-9a-fA-F]{6}$/.test(c));
        
        console.log('Using extracted colors:', cleanColors);
        
        // Build a concise prompt
        let prompt = `Create a ${baseTheme} VS Code theme inspired by: ${cleanColors.join(', ')}`;
        
        if (textPrompt && textPrompt.trim()) {
            prompt += `. Style: ${textPrompt.trim()}`;
        }
        
        prompt += `

${baseTheme === 'dark' ? 'Dark' : 'Light'} theme, ${contrast} contrast. Adapt colors for readability.

Return ONLY this JSON (no explanation):
{"name":"Theme Name","palette":{"background":"#hex","foreground":"#hex","accent":"#hex","selection":"#hex","comment":"#hex","string":"#hex","keyword":"#hex","function":"#hex","class":"#hex","variable":"#hex","property":"#hex","error":"#hex","warning":"#hex","success":"#hex","info":"#hex"}}`;
        
        return prompt;
    }

    /**
     * Cancel ongoing generation
     */
    cancel() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    /**
     * Generate with retry logic
     */
    async generateWithRetry(prompt, options = {}, maxRetries = 2) {
        let lastError;
        
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await this.generateTheme(prompt, options);
            } catch (error) {
                lastError = error;
                console.warn(`Generation attempt ${i + 1} failed:`, error.message);
                
                if (error.message === 'Generation cancelled') {
                    throw error;
                }
                
                // On streaming failure, try non-streaming as fallback
                if (i === maxRetries - 1) {
                    console.log('Trying non-streaming fallback...');
                    try {
                        return await this.generateThemeNonStreaming(prompt, options);
                    } catch (fallbackError) {
                        lastError = fallbackError;
                    }
                }
                
                // Wait before retrying
                if (i < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
        }
        
        throw lastError;
    }
}

// Sample prompts for inspiration
const SamplePrompts = [
    "A warm sunset theme with orange and purple hues, like the sky at dusk",
    "Cyberpunk neon with electric blue and hot pink on dark background",
    "Forest at midnight - deep greens, misty grays, and moonlit silver",
    "Ocean depths - navy blues, teal accents, and coral highlights",
    "Vintage terminal - green phosphor on black, like old CRT monitors",
    "Arctic aurora - icy blues, purples, and green northern lights",
    "Desert sandstorm - warm tans, burnt orange, and dusty rose",
    "Tokyo night - neon signs, dark alleys, rain-soaked streets",
    "Autumn leaves - rich reds, golden yellows, warm browns",
    "Space nebula - deep purple, cosmic blue, stardust white",
    "Minimalist monochrome with subtle blue accents",
    "Retro synthwave - hot pink, electric purple, chrome silver",
    "Coffee shop - warm browns, cream, and cozy amber",
    "Underwater coral reef - vibrant teals, coral pinks, sandy yellows",
    "Industrial steampunk - brass, copper, and aged leather tones"
];

// Export
window.OllamaClient = OllamaClient;
window.SamplePrompts = SamplePrompts;
