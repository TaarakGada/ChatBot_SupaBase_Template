import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

export const useAudioRecording = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (e) => {
                chunksRef.current.push(e.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, {
                    type: 'audio/webm',
                });
                setVoiceBlob(audioBlob);
                chunksRef.current = [];
                stream.getTracks().forEach((track) => track.stop());
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
            timerRef.current = window.setInterval(
                () => setRecordingTime((prev) => prev + 1),
                1000
            );
        } catch (err) {
            console.error('Error accessing microphone:', err);
            toast.error('Failed to access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
            }
        }
    };

    return {
        isRecording,
        recordingTime,
        voiceBlob,
        startRecording,
        stopRecording,
        setVoiceBlob,
    };
};
