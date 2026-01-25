import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { MessagesGateway } from './messages.gateway';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, MessagesGateway],
  exports: [ConversationsService, MessagesGateway],
})
export class ConversationsModule {}
