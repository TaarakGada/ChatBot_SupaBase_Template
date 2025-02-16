// import axios from 'axios';

const AI_BOT_RESPONSE_URL = process.env.NEXT_PUBLIC_AI_BOT_RESPONSE_URL;

export interface AIResponse {
    text: string;
    status: 'success' | 'error';
    error?: string;
}

export async function sendToAI(formData: FormData): Promise<AIResponse> {
    try {
        if (!formData.has('text')) {
            throw new Error('Text is required');
        }

        const response = await fetch("https://e7cb-103-139-247-56.ngrok-free.app/process-request/", {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();  // Only call this once

        console.log(data);  // Log the parsed JSON data, not the raw response

        return {
            text: data.result || data.error || '',
            status: data.error ? 'error' : 'success',
            error: data.error
        };
    } catch (error) {
        return {
            text: '',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

