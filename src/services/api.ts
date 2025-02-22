// import axios from 'axios';

const AI_BOT_RESPONSE_URL = process.env.NEXT_PUBLIC_AI_BOT_RESPONSE_URL;

export interface AIResponse {
    action: string;
    result: any;
    error?: string;
    status: 'success' | 'error';
}

export async function sendToAI(text: string, files?: File[]): Promise<AIResponse> {
    // Mock AI response
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                action: 'mockAction',
                result: { message: `Mock response for: ${text}` },
                status: 'success',
            });
        }, 500); // Simulate a delay
    });

    // try {
    //     const formData = new FormData();
    //     formData.append('text', text);

    //     // Only append the first file if it exists
    //     if (files && files.length > 0) {
    //         formData.append('file', files[0]);
    //     }

    //     const response = await fetch("https://e7cb-103-139-247-56.ngrok-free.app/process-request/", {
    //         method: 'POST',
    //         body: formData,
    //     });

    //     if (!response.ok) {
    //         throw new Error(`API request failed: ${response.statusText}`);
    //     }

    //     const data = await response.json();

    //     return {
    //         action: data.action,
    //         result: data.result,
    //         status: data.error ? 'error' : 'success',
    //         error: data.error
    //     };
    // } catch (error) {
    //     return {
    //         action: 'error',
    //         result: {},
    //         status: 'error',
    //         error: error instanceof Error ? error.message : 'Unknown error occurred'
    //     };
    // }
}

