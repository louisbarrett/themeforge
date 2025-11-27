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
            return models.map(model => ({
                name: model.id || model.name,
                id: model.id || model.name,
                size: model.size || 0,
                owned_by: model.owned_by || 'local'
            }));
            
        } catch (error) {
            console.error('Failed to fetch models:', error);
            throw new Error(`Failed to connect to API at ${this.baseUrl}. Error: ${error.message}`);
        }
    }

    /**
     * Generate a theme using chat completions (OpenAI format)
     */
    async generateTheme(prompt, options = {}) {
        const {
            model = 'llama3.2',
            temperature = 0.7,
            baseTheme = 'dark',
            contrast = 'normal',
            onProgress = null
        } = options;

        // Create abort controller for cancellation
        this.abortController = new AbortController();

        // Build the prompt using ThemeSchema
        const systemPrompt = ThemeSchema.generateSystemPrompt();
        const userPrompt = ThemeSchema.generateSimplifiedPrompt(prompt, { baseTheme, contrast });

        // OpenAI chat completions format
        const requestBody = {
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
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
            contrast = 'normal'
        } = options;

        this.abortController = new AbortController();

        const systemPrompt = ThemeSchema.generateSystemPrompt();
        const userPrompt = ThemeSchema.generateSimplifiedPrompt(prompt, { baseTheme, contrast });

        const requestBody = {
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
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
        
        // Try to find JSON object in the response
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        try {
            const parsed = JSON.parse(jsonStr);
            
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

        } catch (error) {
            console.error('Failed to parse theme response:', error);
            console.error('Raw response:', response);
            throw new Error('Failed to parse AI response as valid JSON. The model may not have generated valid theme data.');
        }
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
