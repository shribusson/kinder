import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';
import { QUEUE_NAMES } from '../queue/queue.constants';
import * as AriClient from 'ari-client';
import { Readable } from 'stream';

export interface DialOptions {
  accountId: string;
  from: string;
  to: string;
  variables?: Record<string, string>;
}

export interface CallData {
  callId: string;
  externalId: string;
  from: string;
  to: string;
  status: string;
  startTime: Date;
  answeredTime?: Date;
  endTime?: Date;
  duration?: number;
}

@Injectable()
export class TelephonyService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelephonyService.name);
  private ariClient: any;
  private connected = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @InjectQueue(QUEUE_NAMES.CALLS) private callsQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Connect to Asterisk ARI
   */
  private async connect() {
    const url = process.env.ASTERISK_ARI_URL || 'http://localhost:8088';
    const username = process.env.ASTERISK_ARI_USERNAME || 'asterisk';
    const password = process.env.ASTERISK_ARI_PASSWORD || 'asterisk';

    try {
      this.ariClient = await new Promise((resolve, reject) => {
        AriClient.connect(url, username, password, (err: Error | null, client: any) => {
          if (err) reject(err);
          else resolve(client);
        });
      });
      this.connected = true;
      this.logger.log(`Connected to Asterisk ARI: ${url}`);

      // Start Stasis application
      await this.ariClient.start('kinder-crm');

      // Register event handlers
      this.registerEventHandlers();
    } catch (error) {
      this.logger.error('Failed to connect to Asterisk ARI:', error);
      this.connected = false;
    }
  }

  /**
   * Disconnect from Asterisk ARI
   */
  private async disconnect() {
    if (this.ariClient) {
      this.logger.log('Disconnecting from Asterisk ARI');
      this.connected = false;
      // ARI client doesn't have explicit disconnect
    }
  }

  /**
   * Register ARI event handlers
   */
  private registerEventHandlers() {
    this.ariClient.on('StasisStart', this.handleStasisStart.bind(this));
    this.ariClient.on('StasisEnd', this.handleStasisEnd.bind(this));
    this.ariClient.on('ChannelStateChange', this.handleChannelStateChange.bind(this));
    this.ariClient.on('ChannelDtmfReceived', this.handleDtmfReceived.bind(this));

    this.logger.log('ARI event handlers registered');
  }

  /**
   * Handle StasisStart event (call enters our application)
   */
  private async handleStasisStart(event: any, channel: any) {
    this.logger.log(`StasisStart: ${channel.id}, caller: ${channel.caller.number}`);

    try {
      // Extract account from channel variables
      const accountId = channel.channelvars?.ACCOUNT_ID || '1';
      const callerNumber = channel.caller.number;
      const calleeNumber = channel.connected?.number || '';
      const direction = event.args[0] === 'inbound' ? 'inbound' : 'outbound';
      const phoneNumber = direction === 'inbound' ? callerNumber : calleeNumber;

      // Create Call record
      const call = await this.prisma.call.create({
        data: {
          accountId,
          phoneNumber: phoneNumber || 'unknown',
          direction,
          status: 'ringing',
          startedAt: new Date(),
          metadata: {
            externalId: channel.id,
            callerNumber,
            calleeNumber,
          },
        },
      });

      this.logger.log(`Call created: ${call.id}`);

      // Answer the call
      await channel.answer();

      // Start recording
      await channel.record({
        name: `call-${call.id}`,
        format: 'wav',
        maxDurationSeconds: 3600,
        maxSilenceSeconds: 30,
        ifExists: 'overwrite',
        beep: true,
        terminateOn: '#',
      });

      // Update call with recording started
      await this.prisma.call.update({
        where: { id: call.id },
        data: { status: 'answered' },
      });
    } catch (error) {
      this.logger.error('Error handling StasisStart:', error);
    }
  }

  /**
   * Handle StasisEnd event (call leaves our application)
   */
  private async handleStasisEnd(event: any, channel: any) {
    this.logger.log(`StasisEnd: ${channel.id}`);

    try {
      const call = await this.prisma.call.findFirst({
        where: {
          metadata: {
            path: ['externalId'],
            equals: channel.id,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!call) {
        this.logger.warn(`Call not found for channel: ${channel.id}`);
        return;
      }

      const duration = call.startedAt
        ? Math.floor((Date.now() - call.startedAt.getTime()) / 1000)
        : 0;

      await this.prisma.call.update({
        where: { id: call.id },
        data: {
          status: 'completed',
          duration,
          endedAt: new Date(),
        },
      });

      // Queue recording processing
      await this.callsQueue.add('process-recording', {
        callId: call.id,
        recordingName: `call-${call.id}`,
      });

      this.logger.log(`Call completed: ${call.id}, duration: ${duration}s`);
    } catch (error) {
      this.logger.error('Error handling StasisEnd:', error);
    }
  }

  /**
   * Handle ChannelStateChange event
   */
  private async handleChannelStateChange(event: any) {
    this.logger.debug(`ChannelStateChange: ${event.channel.id} -> ${event.channel.state}`);

    try {
      const call = await this.prisma.call.findFirst({
        where: {
          metadata: {
            path: ['externalId'],
            equals: event.channel.id,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!call) return;

      let status: 'answered' | 'completed' | null = null;
      if (event.channel.state === 'Up') {
        status = 'answered';
      } else if (event.channel.state === 'Down') {
        status = 'completed';
      }

      if (status) {
        await this.prisma.call.update({
          where: { id: call.id },
          data: { status },
        });
      }
    } catch (error) {
      this.logger.error('Error handling ChannelStateChange:', error);
    }
  }

  /**
   * Handle DTMF (digit press) events
   */
  private async handleDtmfReceived(event: any) {
    this.logger.debug(`DTMF received: ${event.digit} on ${event.channel.id}`);
    
    // TODO: Implement IVR menu logic
    // For now, just log it
  }

  /**
   * Initiate an outbound call
   */
  async initiateCall(options: DialOptions): Promise<{ callId: string }> {
    if (!this.connected) {
      throw new Error('ARI client not connected');
    }

    try {
      // Create Call record
      const call = await this.prisma.call.create({
        data: {
          accountId: options.accountId,
          phoneNumber: options.to,
          direction: 'outbound',
          status: 'initiated',
          startedAt: new Date(),
          metadata: {
            callerNumber: options.from,
            calleeNumber: options.to,
          },
        },
      });

      // Queue the call initiation
      await this.callsQueue.add('initiate-call', {
        callId: call.id,
        from: options.from,
        to: options.to,
        variables: {
          ACCOUNT_ID: options.accountId.toString(),
          ...options.variables,
        },
      });

      this.logger.log(`Outbound call queued: ${call.id}`);

      return { callId: call.id };
    } catch (error) {
      this.logger.error('Failed to initiate call:', error);
      throw error;
    }
  }

  /**
   * Get call details
   */
  async getCall(callId: string, accountId: string): Promise<any> {
    const call = await this.prisma.call.findFirst({
      where: {
        id: callId,
        accountId,
      },
      include: {
        recording: true,
        lead: true,
      },
    });

    return call;
  }

  /**
   * Get call recordings
   */
  async getRecordings(callId: string, accountId: string): Promise<any[]> {
    const recordings = await this.prisma.callRecording.findMany({
      where: {
        call: {
          id: callId,
          accountId,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return recordings;
  }

  /**
   * Download recording from Asterisk and upload to S3
   */
  async processRecording(callId: string, recordingName: string): Promise<void> {
    try {
      const call = await this.prisma.call.findUnique({
        where: { id: callId },
      });

      if (!call) {
        throw new Error(`Call ${callId} not found`);
      }

      // Get recording from Asterisk
      const storedRecording = await this.ariClient.recordings.getStored({
        recordingName,
      });

      // Download recording file
      const recordingUrl = `${process.env.ASTERISK_ARI_URL}/recordings/stored/${recordingName}/file`;
      const response = await fetch(recordingUrl, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.ASTERISK_ARI_USERNAME}:${process.env.ASTERISK_ARI_PASSWORD}`,
          ).toString('base64')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download recording: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // Upload to S3/MinIO
      const storageKey = this.storageService.generateKey(
        call.accountId,
        'recordings',
        `${recordingName}.wav`,
      );

      const { url } = await this.storageService.upload({
        key: storageKey,
        body: buffer,
        contentType: 'audio/wav',
      });

      // Create MediaFile record
      const mediaFile = await this.prisma.mediaFile.create({
        data: {
          accountId: call.accountId,
          name: `${recordingName}.wav`,
          mimeType: 'audio/wav',
          fileSize: buffer.length,
          storageKey,
          url,
        },
      });

      // Create CallRecording record
      await this.prisma.callRecording.create({
        data: {
          callId: call.id,
          url: url,
          duration: storedRecording.duration || 0,
          mediaFileId: mediaFile.id,
          metadata: { format: 'wav' },
        },
      });

      // Delete recording from Asterisk
      await storedRecording.delete();

      this.logger.log(`Recording processed: ${recordingName} -> ${url}`);
    } catch (error) {
      this.logger.error(`Failed to process recording ${recordingName}:`, error);
      throw error;
    }
  }

  /**
   * Get call statistics for an account
   */
  async getCallStats(accountId: string, startDate: Date, endDate: Date): Promise<any> {
    const calls = await this.prisma.call.findMany({
      where: {
        accountId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const stats = {
      total: calls.length,
      inbound: calls.filter((c) => c.direction === 'inbound').length,
      outbound: calls.filter((c) => c.direction === 'outbound').length,
      completed: calls.filter((c) => c.status === 'completed').length,
      failed: calls.filter((c) => c.status === 'failed').length,
      avgDuration: calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length || 0,
      totalDuration: calls.reduce((sum, c) => sum + (c.duration || 0), 0),
    };

    return stats;
  }

  /**
   * Check if ARI is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}
