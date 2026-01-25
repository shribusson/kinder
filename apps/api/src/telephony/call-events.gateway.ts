import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/calls',
})
export class CallEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CallEventsGateway.name);

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Subscribe to call events for an account
   */
  @SubscribeMessage('subscribe')
  async handleSubscribe(client: Socket, payload: { accountId: string; userId: number }) {
    // TODO: Verify user has access to this account
    const room = `account-${payload.accountId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  /**
   * Emit call event to account room
   */
  emitCallEvent(accountId: string, event: string, data: any) {
    const room = `account-${accountId}`;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Emitted ${event} to ${room}`);
  }

  /**
   * Emit call status update
   */
  emitCallStatus(accountId: string, callId: string, status: string) {
    this.emitCallEvent(accountId, 'call:status', { callId, status });
  }

  /**
   * Emit new call notification
   */
  emitNewCall(accountId: string, call: any) {
    this.emitCallEvent(accountId, 'call:new', call);
  }

  /**
   * Emit call ended notification
   */
  emitCallEnded(accountId: string, callId: string, duration: number) {
    this.emitCallEvent(accountId, 'call:ended', { callId, duration });
  }
}
