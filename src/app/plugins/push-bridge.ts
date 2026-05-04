import { registerPlugin } from '@capacitor/core';

export interface PushBridgePlugin {
  getPendingPush(): Promise<{ data: string | null }>;
}

export const PushBridge = registerPlugin<PushBridgePlugin>('PushBridge');
