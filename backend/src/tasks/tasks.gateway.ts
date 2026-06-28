import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TASK_EVENTS, TaskDeletedPayload, TaskResponse } from './tasks.types';

type TaskEventPayload = TaskResponse | TaskDeletedPayload;

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class TasksGateway implements OnGatewayConnection, OnGatewayInit {
  private readonly logger = new Logger(TasksGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly configService: ConfigService) {}

  afterInit(): void {
    const corsOrigin = this.configService.get<string>('CORS_ORIGIN');
    if (!corsOrigin) {
      throw new Error('CORS_ORIGIN environment variable is required');
    }

    this.server.engine.opts.cors = {
      origin: corsOrigin,
      credentials: true,
    };
  }

  handleConnection(@ConnectedSocket() client: Socket): void {
    const userId = client.handshake.auth?.userId as string | undefined;
    if (typeof userId === 'string' && userId.length > 0) {
      void client.join(this.userRoom(userId));
      return;
    }

    this.logger.warn(`Client ${client.id} connected without userId`);
  }

  emitToUser(
    userId: string,
    event: (typeof TASK_EVENTS)[keyof typeof TASK_EVENTS],
    payload: TaskEventPayload,
  ): void {
    this.server.to(this.userRoom(userId)).emit(event, payload);
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }
}
