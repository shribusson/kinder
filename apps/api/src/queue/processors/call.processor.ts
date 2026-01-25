import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma.service';
// TODO: Re-enable after schema migration
// import { TelephonyService } from '../../telephony/telephony.service';
import { CallDirection, CallStatus } from '@prisma/client';

export interface InitiateCallJobData {
  callId: string;
  from: string;
  to: string;
  variables?: Record<string, string>;
}

export interface ProcessRecordingJobData {
  callId: string;
  recordingName: string;
}

@Processor('calls')
export class CallProcessor {
  private readonly logger = new Logger(CallProcessor.name);

  constructor(
    private prisma: PrismaService,
    // TODO: Re-enable after schema migration
    // private telephonyService: TelephonyService,
  ) {}

  @Process('initiate-call')
  async initiateCall(job: Job<InitiateCallJobData>) {
    const { callId, from, to, variables } = job.data;
    this.logger.log(`Initiating call ${callId}: ${from} -> ${to}`);

    try {
      // TODO: Use ARI client to originate call
      // For now, just update status
      await this.prisma.call.update({
        where: { id: callId },
        data: { status: 'ringing' },
      });

      this.logger.log(`Call ${callId} initiated successfully`);
      return { success: true, callId };
    } catch (error) {
      this.logger.error(`Failed to initiate call ${callId}:`, error);
      
      await this.prisma.call.update({
        where: { id: callId },
        data: { status: 'failed' },
      });

      throw error;
    }
  }

  @Process('process-recording')
  async processRecording(job: Job<ProcessRecordingJobData>) {
    const { callId, recordingName } = job.data;
    this.logger.log(`Processing recording for call ${callId}: ${recordingName}`);

    try {
      // TODO: Re-enable after schema migration
      // await this.telephonyService.processRecording(callId, recordingName);
      this.logger.warn(`Telephony module disabled - recording ${recordingName} for call ${callId} not processed`);

      this.logger.log(`Recording processed successfully for call ${callId}`);
      return { success: true, callId };
    } catch (error) {
      this.logger.error(`Failed to process recording for call ${callId}:`, error);
      throw error;
    }
  }
}
