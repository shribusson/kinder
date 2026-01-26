import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { QUEUE_NAMES } from '../queue/queue.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/queues')
export class QueuesController {
  private serverAdapter: ExpressAdapter;

  constructor(
    @InjectQueue(QUEUE_NAMES.WEBHOOKS) private webhooksQueue: Queue,
    @InjectQueue(QUEUE_NAMES.OUTBOUND_MESSAGES) private messagesQueue: Queue,
    @InjectQueue(QUEUE_NAMES.CALLS) private callsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.MEDIA_PROCESSING) private mediaQueue: Queue,
    @InjectQueue(QUEUE_NAMES.ANALYTICS) private analyticsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private notificationsQueue: Queue,
  ) {
    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [
        new BullAdapter(this.webhooksQueue),
        new BullAdapter(this.messagesQueue),
        new BullAdapter(this.callsQueue),
        new BullAdapter(this.mediaQueue),
        new BullAdapter(this.analyticsQueue),
        new BullAdapter(this.notificationsQueue),
      ],
      serverAdapter: this.serverAdapter,
    });
  }

  @Get('*')
  @UseGuards(JwtAuthGuard)
  async bullBoard(@Req() req: any, @Res() res: any) {
    const handler = this.serverAdapter.getRouter();
    return handler(req, res);
  }
}
