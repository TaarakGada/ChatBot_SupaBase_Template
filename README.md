# AI Chat Interface

A modern, responsive chat interface built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 💬 Real-time chat interface
- 🎤 Voice recording support
- 📎 File attachments
- 🛠 Tool integration system
- 🔐 Authentication with Supabase
- 🎨 Dark mode support
- 💅 Responsive design

## Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account
- AI backend endpoint

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_AI_BOT_RESPONSE_URL=your_ai_endpoint
```

### Database Setup

1. Use the provided `schema.sql` in the `supabase` folder to set up your database tables
2. The schema creates three main tables:
   - `profiles`: User profiles
   - `chats`: Chat sessions
   - `messages`: Individual messages

### API Integration

1. The chat interface expects API responses in the following format:
```typescript
interface AIResponse {
    action: string;
    result: any;
    error?: string;
    status: 'success' | 'error';
}
```

2. To integrate your AI backend:
   - Update the `sendToAI` function in `src/services/api.ts`
   - Ensure your API endpoint handles both text and file inputs
   - Response should include appropriate action and result fields

### Supabase Integration

1. Replace placeholder code in `chatService.ts` with actual Supabase queries:
   - Uncomment the Supabase queries
   - Remove placeholder return values
   - Ensure proper error handling

2. Functions to implement:
   - `fetchChats`: Retrieve user's chat history
   - `createChat`: Start new chat session
   - `saveMessage`: Store messages
   - `uploadFile`: Handle file uploads

Example implementation:
```typescript
async fetchChats(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data || [];
}
```

## Usage

The chat interface components are modular and can be used independently:

```tsx
import { MessageInput } from './components/MessageInput';
import { Message } from './components/Message';

// In your chat component:
const handleSendMessage = async (content: string, files?: File[]) => {
    // 1. Save message to Supabase
    const message = await chatService.saveMessage({
        chat_id: currentChatId,
        content: { text: content },
        is_user: true
    });

    // 2. Send to AI backend
    const aiResponse = await sendToAI(content, files);

    // 3. Save AI response
    await chatService.saveMessage({
        chat_id: currentChatId,
        content: { text: aiResponse.result },
        is_user: false
    });
};
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
