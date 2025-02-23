// import axios from 'axios';

const AI_BOT_RESPONSE_URL = process.env.NEXT_PUBLIC_AI_BOT_RESPONSE_URL;

export interface AIResponse {
    action: string;
    result: any;
    error?: string;
    status: 'success' | 'error';
}

export async function sendToAI(text: string, files?: File[], voiceBlob?: Blob): Promise<AIResponse> {
    // Mock AI response for now
    return new Promise(resolve => {
        // Create a more detailed mock response showing what would be sent
        const fileDetails = files?.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type
        }));

        const voiceDetails = voiceBlob ? {
            size: voiceBlob.size,
            type: voiceBlob.type
        } : null;

        setTimeout(() => {
            resolve({
                action: 'mockAction',
                result: {
                    message: `Mock response for:
                    Text: ${text}
                    Files: ${JSON.stringify(fileDetails)}
                    Voice: ${JSON.stringify(voiceDetails)}`
                },
                status: 'success',
            });
        }, 500);
    });

    // Real API implementation (commented out for now)
    // try {
    //     const formData = new FormData();
    //     formData.append('text', text);
    //
    //     // Append all files
    //     if (files) {
    //         files.forEach((file, index) => {
    //             formData.append(`file${index}`, file);
    //         });
    //     }
    //
    //     // Append voice data if exists
    //     if (voiceBlob) {
    //         formData.append('voice', voiceBlob);
    //     }
    //
    //     const response = await fetch("YOUR_API_ENDPOINT", {
    //         method: 'POST',
    //         body: formData,
    //     });
    //
    //     if (!response.ok) {
    //         throw new Error(`API request failed: ${response.statusText}`);
    //     }
    //
    //     return await response.json();
    // } catch (error) {
    //     return {
    //         action: 'error',
    //         result: {},
    //         status: 'error',
    //         error: error instanceof Error ? error.message : 'Unknown error occurred'
    //     };
    // }
}

