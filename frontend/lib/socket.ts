import { io, Socket } from 'socket.io-client';
import { getSocketBaseUrl } from './env';

let socket: Socket | null = null;

export function getSocket(userId: string): Socket {
  if (!socket) {
    socket = io(getSocketBaseUrl(), {
      auth: { userId },
      transports: ['websocket', 'polling'],
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
