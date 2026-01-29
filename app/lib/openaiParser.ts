import { OCRPersonResponse } from '../types/apiTypes';
import type { ChatCompletion } from 'openai/resources/chat/completions';

/**
 * Parse result type
 */
interface ParseResult {
    type: 'arr' | 'obj' | 'raw';
    output: OCRPersonResponse[] | string;
}

/**
 * Safe parse GPT response to JSON array
 * Handles various response formats from GPT-4o
 */
export function safeParse(str: string | null | undefined): ParseResult | null {
    if (!str) return null;

    // 1. If contains ```json ... ```
    if (str.includes('```json')) {
        const match = str.match(/```json([\s\S]*?)```/);
        if (match) {
            let cleaned = match[1].trim();
            try {
                const parsed = JSON.parse(cleaned);
                return { type: 'arr', output: parsed };
            } catch {
                // Try to fix common JSON issues
                cleaned = fixJsonString(cleaned);
                try {
                    return { type: 'arr', output: JSON.parse(cleaned) };
                } catch {
                    // Return as raw if can't parse
                }
            }
        }
    }

    // 2. If looks like object { ... }
    if (/^\{[\s\S]*\}$/.test(str.trim())) {
        try {
            const fixed = fixJsonString(str);
            return { type: 'obj', output: JSON.parse(fixed) };
        } catch {
            // Continue to next attempt
        }
    }

    // 3. If looks like array [ ... ]
    if (/^\[[\s\S]*\]$/.test(str.trim())) {
        try {
            return { type: 'arr', output: JSON.parse(str) };
        } catch {
            try {
                const fixed = fixJsonString(str);
                return { type: 'arr', output: JSON.parse(fixed) };
            } catch {
                // Continue
            }
        }
    }

    // 4. Try direct parse
    try {
        return { type: 'arr', output: JSON.parse(str) };
    } catch {
        // Failed all parsing attempts
    }

    return { type: 'raw', output: str };
}

/**
 * Fix common JSON string issues
 */
function fixJsonString(str: string): string {
    return str
        .replace(/(\w+)\s*:/g, '"$1":') // Add quotes to unquoted keys
        .replace(/'/g, '"')              // Replace single quotes with double
        .replace(/,\s*([}\]])/g, '$1')   // Remove trailing commas
        .replace(/\n/g, '\\n');          // Escape newlines in values
}

/**
 * Parse OpenAI SDK ChatCompletion response
 * This is the new function for SDK format
 */
export function parseOCRResponseFromSDK(response: ChatCompletion): OCRPersonResponse[] | null {
    // SDK response format: response.choices[0].message.content
    const content = response.choices?.[0]?.message?.content;
    if (!content) return null;

    const result = safeParse(content);
    if (!result) return null;

    if (result.type === 'arr' && Array.isArray(result.output)) {
        return result.output as OCRPersonResponse[];
    }

    return null;
}

/**
 * Extract text content from OpenAI REST API response (legacy)
 * @deprecated Use parseOCRResponseFromSDK instead
 */
export function extractTextFromResponse(response: unknown): string | null {
    if (!response || typeof response !== 'object') return null;

    const res = response as { output?: Array<{ content?: Array<{ text?: string }> }> };

    if (res.output && Array.isArray(res.output) && res.output[0]) {
        const content = res.output[0].content;
        if (Array.isArray(content) && content[0]?.text) {
            return content[0].text;
        }
    }

    return null;
}

/**
 * Parse OpenAI REST API response (legacy)
 * @deprecated Use parseOCRResponseFromSDK instead
 */
export function parseOCRResponse(response: unknown): OCRPersonResponse[] | null {
    const text = extractTextFromResponse(response);
    if (!text) return null;

    const result = safeParse(text);
    if (!result) return null;

    if (result.type === 'arr' && Array.isArray(result.output)) {
        return result.output as OCRPersonResponse[];
    }

    return null;
}
