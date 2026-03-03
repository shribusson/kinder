import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseCallEventsOptions {
  accountId: string;
  onNewCall?: (call: any) => void;
  onCallStatusChanged?: (callId: string, status: string) => void;
  onCallEnded?: (callId: string, duration: number) => void;
  onNewLead?: (lead: any) => void;
}

export function useCallEvents({
  accountId,
  onNewCall,
  onCallStatusChanged,
  onCallEnded,
  onNewLead,
}: UseCallEventsOptions) {
  const socketRef = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const socketUrl = apiBaseUrl.replace('/api', '').replace(':3001', ':3001');

    const socket = io(`${socketUrl}/calls`, {
      auth: {
        token: localStorage.getItem('token'),
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    return socket;
  }, []);

  useEffect(() => {
    const socket = socketRef();
    if (!socket) return;

    socket.on('connect', () => {
      console.log('Connected to call events');
      // Subscribe to account's call events
      socket.emit('subscribe', { accountId });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from call events');
    });

    socket.on('call:new', (call: any) => {
      console.log('New call:', call);
      onNewCall?.(call);
    });

    socket.on('call:status', ({ callId, status }: { callId: string; status: string }) => {
      console.log('Call status changed:', callId, status);
      onCallStatusChanged?.(callId, status);
    });

    socket.on('call:ended', ({ callId, duration }: { callId: string; duration: number }) => {
      console.log('Call ended:', callId, duration);
      onCallEnded?.(callId, duration);
    });

    socket.on('lead:created', (lead: any) => {
      console.log('New lead created:', lead);
      onNewLead?.(lead);
    });

    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [accountId, onNewCall, onCallStatusChanged, onCallEnded, onNewLead, socketRef]);
}
