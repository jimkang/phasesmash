import { Sampler } from './synths/synth-node';

export interface LoopDeck {
  id: string;
  samplePath?: string;
  sampleBuffer?: AudioBuffer;
  pan: number;
  loopStartSecs: number;
  loopEndSecs: number;
  amp: number;
  isPlaying?: boolean;
  samplerNode?: Sampler;
  beginPlayAtSecs?: number;
  durationToPlaySecs?: number;
  // Is this, like, all of the types?
  [index: string]:
    | string
    | number
    | AudioBuffer
    | boolean
    | Sampler
    | undefined;
}
