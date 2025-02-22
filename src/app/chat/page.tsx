'use client';

import { useEffect, useState } from 'react';
import { ChatContainer } from '@/components/ChatContainer';
import { Sidebar } from '@/components/Sidebar';
import { userService } from '@/services/userService';
import { chatService } from '@/services/chatService';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export default function ChatPage() {
    const [user, setUser] = useState<any>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeChatId, setActiveChatId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const checkAuthAndInitialize = async () => {
            try {
                setIsLoading(true);
                console.log('[ChatPage] Starting checkAuthAndInitialize');

                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error(
                        '[ChatPage] Error fetching session:',
                        sessionError
                    );
                    throw sessionError;
                }

                if (!session) {
                    console.log(
                        '[ChatPage] No session found, redirecting to login'
                    );
                    router.replace('/');
                    return;
                }

                const currentUser = session.user;
                if (!currentUser) {
                    console.warn('[ChatPage] No user found in session');
                    router.replace('/');
                    return;
                }

                if (!isMounted) return;
                setUser(currentUser);
                console.log('[ChatPage] User set:', currentUser);

                try {
                    console.log('[ChatPage] Upserting user:', currentUser.id);
                    await userService.upsertUser({
                        id: currentUser.id,
                        name: currentUser.email || 'Anonymous',
                        email: currentUser.email || 'anonymous@example.com',
                    });
                    console.log('[ChatPage] User upserted successfully');

                    console.log(
                        '[ChatPage] Fetching chats for user:',
                        currentUser.id
                    );
                    const chats = await chatService.fetchChats(currentUser.id);
                    console.log('[ChatPage] Chats fetched:', chats);

                    if (!isMounted) return;

                    if (!chats || chats.length === 0) {
                        console.log(
                            '[ChatPage] No chats found, creating new chat'
                        );
                        const newChat = await chatService.createChat(
                            currentUser.id,
                            'New Chat'
                        );
                        console.log('[ChatPage] New chat created:', newChat);
                        if (newChat?.id && isMounted) {
                            setActiveChatId(newChat.id);
                            console.log(
                                '[ChatPage] Active chat ID set to new chat:',
                                newChat.id
                            );
                        } else {
                            console.warn(
                                '[ChatPage] New chat creation failed or no ID returned'
                            );
                        }
                    } else if (chats[0]?.id && isMounted) {
                        setActiveChatId(chats[0].id);
                        console.log(
                            '[ChatPage] Active chat ID set to existing chat:',
                            chats[0].id
                        );
                    }
                } catch (error) {
                    console.error(
                        '[ChatPage] Error initializing user data:',
                        error
                    );
                    toast.error('Failed to initialize user data');
                }
            } catch (error) {
                console.error('[ChatPage] Auth check failed:', error);
                toast.error('Authentication failed');
                router.replace('/');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                    console.log('[ChatPage] setIsLoading(false)');
                }
            }
        };

        checkAuthAndInitialize();

        // Set up auth state change listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                router.replace('/');
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [router]);

    const handleDeleteChat = async (chatId: string) => {
        try {
            await chatService.deleteChat(chatId);
            if (activeChatId === chatId) {
                const chats = await chatService.fetchChats(user.id);
                if (chats.length > 0) {
                    setActiveChatId(chats[0].id);
                } else {
                    const newChat = await chatService.createChat(
                        user.id,
                        'New Chat'
                    );
                    setActiveChatId(newChat.id);
                }
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            toast.error('Failed to delete chat');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-gray-600">
                <div className="text-white">
                    <div className="animate-pulse">Loading your chats...</div>
                </div>
            </div>
        );
    }

    if (!user || !activeChatId) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-gray-600">
                <div className="text-white">
                    Unable to load chat. Please refresh the page.
                </div>
            </div>
        );
    }

    return (
        <main className="flex h-screen bg-gradient-to-b from-gray-900 to-gray-600">
            <Toaster position="top-right" />
            <Sidebar
                userId={user.id}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
                onDeleteChat={handleDeleteChat}
            />
            <div
                className={`flex-1 transition-all duration-300 ${
                    isCollapsed ? 'ml-0' : 'ml-64'
                }`}
            ></div>
            <ChatContainer
                activeChatId={activeChatId}
                userId={user.id}
            />
        </main>
    );
}
