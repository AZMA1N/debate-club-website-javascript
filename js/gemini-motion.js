// Gemini Motion Generator Module
// Handles AI-powered motion generation with fallback to static motions

(function (window) {
    'use strict';

    const API_ENDPOINT = '/api/generate-motion';
    const REQUEST_TIMEOUT = 10000; // 10 seconds
    const MAX_RETRIES = 2;

    /**
     * Generate a debate motion using Gemini AI
     * @param {string} topic - The debate topic
     * @param {string} format - The debate format (BP, Asian, WUDC, etc.)
     * @returns {Promise<Object>} Motion data object
     */
    async function generateMotion(topic, format) {
        let lastError = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ topic, format }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }

                const data = await response.json();

                if (!data.success || !data.motion) {
                    throw new Error('Invalid response from server');
                }

                return {
                    motion: data.motion,
                    topic: data.topic || topic,
                    format: data.format || format,
                    source: 'ai',
                    timestamp: data.timestamp || new Date().toISOString()
                };

            } catch (error) {
                lastError = error;

                // Don't retry on abort (timeout)
                if (error.name === 'AbortError') {
                    console.warn(`Motion generation timeout (attempt ${attempt + 1})`);
                    if (attempt === MAX_RETRIES) break;
                    await sleep(1000 * (attempt + 1)); // Exponential backoff
                    continue;
                }

                // Don't retry on network errors
                if (error.message.includes('Failed to fetch')) {
                    console.warn('Network error, falling back to static motions');
                    break;
                }

                // Retry on server errors
                if (attempt < MAX_RETRIES) {
                    console.warn(`Retrying motion generation (attempt ${attempt + 2})`);
                    await sleep(500 * (attempt + 1));
                    continue;
                }
            }
        }

        // If all retries failed, return null to trigger fallback
        console.error('Motion generation failed:', lastError?.message);
        return null;
    }

    /**
     * Check if the AI service is available
     * @returns {Promise<boolean>}
     */
    async function checkServiceHealth() {
        try {
            const response = await fetch('/api/health', {
                method: 'GET',
                cache: 'no-cache'
            });

            if (!response.ok) return false;

            const data = await response.json();
            return data.status === 'ok' && data.geminiAvailable === true;
        } catch (error) {
            console.warn('Health check failed:', error.message);
            return false;
        }
    }

    /**
     * Sleep utility for retry delays
     * @param {number} ms - Milliseconds to sleep
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get a random static motion as fallback
     * @param {Array} motions - Array of static motions
     * @param {string} topic - Preferred topic (optional)
     * @returns {Object|null}
     */
    function getStaticMotion(motions, topic = null) {
        if (!motions || !motions.length) return null;

        // Try to find a motion matching the topic
        if (topic) {
            const matching = motions.filter(m =>
                m.topic && m.topic.toLowerCase().includes(topic.toLowerCase())
            );
            if (matching.length > 0) {
                return {
                    ...matching[Math.floor(Math.random() * matching.length)],
                    source: 'static'
                };
            }
        }

        // Return random motion
        return {
            ...motions[Math.floor(Math.random() * motions.length)],
            source: 'static'
        };
    }

    // Export to window
    window.GeminiMotion = {
        generateMotion,
        checkServiceHealth,
        getStaticMotion
    };

})(window);
