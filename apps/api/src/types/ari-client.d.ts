declare module 'ari-client' {
  export interface AriClient {
    on(event: string, handler: (...args: any[]) => void): void;
    start(appName: string): void;
    Channel: any;
    channels: {
      get(params: { channelId: string }): Promise<any>;
      dial(params: any): Promise<any>;
      answer(params: { channelId: string }): Promise<void>;
      hangup(params: { channelId: string }): Promise<void>;
      setChannelVar(params: { channelId: string; variable: string; value: string }): Promise<void>;
    };
    recordings: {
      getStored(params: { recordingName: string }): Promise<any>;
    };
  }

  export function connect(
    url: string,
    username: string,
    password: string,
    callback: (err: Error | null, client: AriClient) => void
  ): void;
}
