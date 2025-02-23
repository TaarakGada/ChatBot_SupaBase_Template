// import axios from 'axios';

const AI_BOT_RESPONSE_URL = process.env.NEXT_PUBLIC_AI_BOT_RESPONSE_URL;

export interface ProcessResponse {
    action: string;
    result: any;
    error?: string;
}

export async function sendToAI(text: string, files?: File[], voiceBlob?: Blob): Promise<ProcessResponse> {
    try {
        const formData = new FormData();
        formData.append('text', text);

        // Backend expects single file, so we'll send the first file if any
        if (files && files.length > 0) {
            formData.append('file', files[0]);
        } else if (voiceBlob) {
            // If no files but voice exists, send voice as file
            formData.append('file', new File([voiceBlob], 'voice.wav', { type: 'audio/wav' }));
        }

        const response = await fetch('https://ff0a-103-139-247-61.ngrok-free.app/process-request/', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data as ProcessResponse;
    } catch (error) {
        return {
            action: 'DIRECT_QUERY',
            result: {},
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

