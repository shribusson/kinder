import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        this.logger.warn(`Client ${client.id} disconnected: no token provided`);
        return;
      }

      const decoded = await this.jwtService.verifyAsync(token);
      client.data.user = decoded;
      this.logger.log(`Client ${client.id} connected with userId: ${decoded.sub}`);
    } catch (error) {
      client.disconnect();
      this.logger.warn(`Client ${client.id} disconnected: invalid token`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Subscribe to call events for an account
   */
  @SubscribeMessage('subscribe')
  async handleSubscribe(client: Socket, payload: { accountId: string; userId: number }) {
    // Verify user is authenticated
    if (!client.data.user) {
      throw new WsException('Unauthorized');
    }

    // Verify user has access to this account
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_accountId: {
          userId: client.data.user.sub,
          accountId: payload.accountId,
        },
      },
    });

    if (!membership) {
      throw new WsException('Access denied to this account');
    }

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
