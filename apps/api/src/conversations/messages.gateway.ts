import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Subscribe to account messages
   */
  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { accountId: string; userId: string },
  ) {
    // TODO: Verify user has access to this account
    const room = `account-${payload.accountId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);

    return { success: true };
  }

  /**
   * Unsubscribe from account messages
   */
  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { accountId: string },
  ) {
    const room = `account-${payload.accountId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);

    return { success: true };
  }

  /**
   * Subscribe to specific conversation
   */
  @SubscribeMessage('subscribe:conversation')
  async handleSubscribeConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const room = `conversation-${payload.conversationId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined conversation ${room}`);

    return { success: true };
  }

  /**
   * Emit new message to account subscribers
   */
  emitNewMessage(accountId: string, message: any) {
    const room = `account-${accountId}`;
    this.server.to(room).emit('message:new', message);
    this.logger.debug(`Emitted new message to ${room}`);
  }

  /**
   * Emit message to specific conversation
   */
  emitMessageToConversation(conversationId: string, event: string, data: any) {
    const room = `conversation-${conversationId}`;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Emitted ${event} to ${room}`);
  }

  /**
   * Emit message status update
   */
  emitMessageStatus(accountId: string, messageId: string, status: string) {
    const room = `account-${accountId}`;
    this.server.to(room).emit('message:status', { messageId, status });
    this.logger.debug(`Emitted message status to ${room}`);
  }

  /**
   * Emit typing indicator
   */
  emitTyping(conversationId: string, userId: string, isTyping: boolean) {
    const room = `conversation-${conversationId}`;
    this.server.to(room).emit('typing', { userId, isTyping });
  }

  /**
   * Emit conversation update
   */
  emitConversationUpdate(accountId: string, conversation: any) {
    const room = `account-${accountId}`;
    this.server.to(room).emit('conversation:updated', conversation);
    this.logger.debug(`Emitted conversation update to ${room}`);
  }
}
