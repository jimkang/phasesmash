export interface LoopDeck {
  id: string;
  sampleBuffer?: AudioBuffer;
  pan: number;
  loopStartSecs: number;
  loopEndSecs: number;
  amp: number;
}
