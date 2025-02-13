export interface AIResponse {
    text: string;
    status: 'success' | 'error';
    error?: string;
}

export async function sendToAI(formData: FormData): Promise<AIResponse> {
    try {
        // Mock API call - Replace with actual API endpoint
        const response = await fetch('YOUR_AI_ENDPOINT', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        // Mock response - Replace with actual API response handling
        return {
            text: "I've processed your request. Here's what I understood:\n" +
                (formData.get('message') ? `- Message: ${formData.get('message')}\n` : '') +
                (formData.get('audio') ? "- I've processed your voice message\n" : '') +
                (formData.getAll('files').length ? `- Received ${formData.getAll('files').length} files\n` : ''),
            status: 'success'
        };
    } catch (error) {
        return {
            text: '',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
