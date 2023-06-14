export interface LoopDeck {
  id: string;
  sampleBuffer?: ArrayBuffer;
  pan: number;
  loopStartSecs: number;
  loopEndSecs: number;
  amp: number;
}