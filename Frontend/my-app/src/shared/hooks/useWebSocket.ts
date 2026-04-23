import { useEffect, useRef } from 'react';

export const useWebSocket = (onMessage: (data: any) => void, userId?: string) => {
  const ws = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let shouldReconnect = true;

    const connect = () => {
      if (!shouldReconnect) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      const url = `${protocol}//${host}:3100/ws${userId ? `?userId=${userId}` : ''}`;
      
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('Successfully connected to WebSocket at', url);
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageRef.current(data);
        } catch (err) {}
      };
      
      ws.current.onclose = (event) => {
        if (shouldReconnect) {
          setTimeout(connect, 3000);
        }
      };
      
      ws.current.onerror = (err: any) => {
        ws.current?.close();
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      ws.current?.close();
    };
  }, [userId]);

  return ws.current;
};
