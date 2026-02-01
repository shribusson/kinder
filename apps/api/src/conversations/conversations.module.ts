import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { MessagesGateway } from './messages.gateway';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    QueueModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, MessagesGateway],
  exports: [ConversationsService, MessagesGateway],
})
export class ConversationsModule {}
