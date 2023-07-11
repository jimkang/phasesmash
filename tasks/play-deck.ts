import { LoopDeck } from '../types';
import { Gain, Panner, Sampler, SynthNode } from '../synths/synth-node';

export function playDeck({
  deck,
  outNode,
}: {
  deck: LoopDeck;
  outNode: SynthNode | undefined;
}) {
  var sampler = new Sampler(outNode?.ctx, {
    sampleBuffer: deck.sampleBuffer,
    loop: true,
    loopStart: deck.loopStartSecs,
    loopEnd: deck.loopEndSecs,
  });
  var amp = new Gain(outNode?.ctx, { gain: deck.amp });
  var panner = new Panner(outNode?.ctx, { pan: deck.pan });

  sampler.connect({ synthNode: amp, audioNode: null });
  amp.connect({ synthNode: panner, audioNode: null });
  panner.connect({ synthNode: outNode, audioNode: null });

  sampler.playLoop({
    startSecs: deck.beginPlayAtSecs,
    durationSecs: deck.durationToPlaySecs,
  });
  return sampler;
}
