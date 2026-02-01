import { Test, TestingModule } from '@nestjs/testing';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { MessagesGateway } from './messages.gateway';
import { PrismaService } from '../prisma.service';
import { Socket, Server } from 'socket.io';

describe('MessagesGateway', () => {
  let gateway: MessagesGateway;
  let prismaService: any;
  let jwtService: any;
  let mockServer: any;

  const mockMembership = {
    id: 'membership-123',
    userId: 'user-123',
    accountId: 'account-123',
    role: 'manager',
  };

  const createMockSocket = (overrides = {}): Partial<Socket> => ({
    id: 'socket-123',
    data: {},
    handshake: {
      auth: { token: 'valid-token' },
      headers: {},
    } as any,
    disconnect: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    ...overrides,
  });

  beforeEach(async () => {
    prismaService = {
      membership: {
        findUnique: jest.fn(),
      },
    };

    jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'user-123',
        email: 'test@example.com',
      }),
    };

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesGateway,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    gateway = module.get<MessagesGateway>(MessagesGateway);
    gateway.server = mockServer as unknown as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should connect client with valid token from auth', async () => {
      const client = createMockSocket();

      await gateway.handleConnection(client as Socket);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(client.data!.user).toEqual({
        sub: 'user-123',
        email: 'test@example.com',
      });
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should connect client with valid token from header', async () => {
      const client = createMockSocket({
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer header-token' },
        },
      });

      await gateway.handleConnection(client as Socket);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('header-token');
    });

    it('should disconnect client without token', async () => {
      const client = createMockSocket({
        handshake: {
          auth: {},
          headers: {},
        },
      });

      await gateway.handleConnection(client as Socket);

      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client with invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      const client = createMockSocket();

      await gateway.handleConnection(client as Socket);

      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should log disconnection', () => {
      const client = createMockSocket();

      // Should not throw
      gateway.handleDisconnect(client as Socket);
    });
  });

  describe('handleSubscribe', () => {
    it('should join account room with valid membership', async () => {
      prismaService.membership.findUnique.mockResolvedValue(mockMembership);
      const client = createMockSocket({
        data: { user: { sub: 'user-123' } },
      });

      const result = await gateway.handleSubscribe(
        client as Socket,
        { accountId: 'account-123', userId: 'user-123' },
      );

      expect(result).toEqual({ success: true });
      expect(client.join).toHaveBeenCalledWith('account-account-123');
    });

    it('should throw WsException when not authenticated', async () => {
      const client = createMockSocket({
        data: {}, // No user
      });

      await expect(
        gateway.handleSubscribe(client as Socket, { accountId: 'account-123', userId: 'user-123' }),
      ).rejects.toThrow(WsException);
    });

    it('should throw WsException when no membership found', async () => {
      prismaService.membership.findUnique.mockResolvedValue(null);
      const client = createMockSocket({
        data: { user: { sub: 'user-123' } },
      });

      await expect(
        gateway.handleSubscribe(client as Socket, { accountId: 'account-123', userId: 'user-123' }),
      ).rejects.toThrow(WsException);
    });
  });

  describe('handleUnsubscribe', () => {
    it('should leave account room', async () => {
      const client = createMockSocket();

      const result = await gateway.handleUnsubscribe(
        client as Socket,
        { accountId: 'account-123' },
      );

      expect(result).toEqual({ success: true });
      expect(client.leave).toHaveBeenCalledWith('account-account-123');
    });
  });

  describe('handleSubscribeConversation', () => {
    it('should join conversation room', async () => {
      const client = createMockSocket();

      const result = await gateway.handleSubscribeConversation(
        client as Socket,
        { conversationId: 'conv-123' },
      );

      expect(result).toEqual({ success: true });
      expect(client.join).toHaveBeenCalledWith('conversation-conv-123');
    });
  });

  describe('emitNewMessage', () => {
    it('should emit message to account room', () => {
      const message = { id: 'msg-123', content: 'Hello!' };

      gateway.emitNewMessage('account-123', message);

      expect(mockServer.to).toHaveBeenCalledWith('account-account-123');
      expect(mockServer.emit).toHaveBeenCalledWith('message:new', message);
    });
  });

  describe('emitMessageToConversation', () => {
    it('should emit event to conversation room', () => {
      const data = { someKey: 'someValue' };

      gateway.emitMessageToConversation('conv-123', 'custom:event', data);

      expect(mockServer.to).toHaveBeenCalledWith('conversation-conv-123');
      expect(mockServer.emit).toHaveBeenCalledWith('custom:event', data);
    });
  });

  describe('emitMessageStatus', () => {
    it('should emit status update to account room', () => {
      gateway.emitMessageStatus('account-123', 'msg-123', 'delivered');

      expect(mockServer.to).toHaveBeenCalledWith('account-account-123');
      expect(mockServer.emit).toHaveBeenCalledWith('message:status', {
        messageId: 'msg-123',
        status: 'delivered',
      });
    });
  });

  describe('emitTyping', () => {
    it('should emit typing indicator to conversation room', () => {
      gateway.emitTyping('conv-123', 'user-456', true);

      expect(mockServer.to).toHaveBeenCalledWith('conversation-conv-123');
      expect(mockServer.emit).toHaveBeenCalledWith('typing', {
        userId: 'user-456',
        isTyping: true,
      });
    });

    it('should emit stopped typing to conversation room', () => {
      gateway.emitTyping('conv-123', 'user-456', false);

      expect(mockServer.emit).toHaveBeenCalledWith('typing', {
        userId: 'user-456',
        isTyping: false,
      });
    });
  });

  describe('emitConversationUpdate', () => {
    it('should emit conversation update to account room', () => {
      const conversation = { id: 'conv-123', status: 'archived' };

      gateway.emitConversationUpdate('account-123', conversation);

      expect(mockServer.to).toHaveBeenCalledWith('account-account-123');
      expect(mockServer.emit).toHaveBeenCalledWith('conversation:updated', conversation);
    });
  });
});
