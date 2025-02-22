'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Toaster } from 'react-hot-toast';
import { Login } from '@/components/Login'; // Make sure this component exists

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session) {
                router.replace('/chat');
            }
        };

        checkAuth();
    }, [router]);

    return (
        <main className="flex min-h-screen">
            <Toaster position="top-right" />
            <Login />
        </main>
    );
}
