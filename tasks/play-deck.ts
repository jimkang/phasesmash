import { LoopDeck } from '../types';
import {
  Envelope,
  Gain,
  Panner,
  Sampler,
  SynthNode,
} from '../synths/synth-node';

var noClipCurve = [0, 1, 1, 1, 1, 1, 0.95, 0.9, 0.8, 0.72, 0];

export function playDeck({
  deck,
  outNode,
  deckCount,
}: {
  deck: LoopDeck;
  outNode: SynthNode | undefined;
  deckCount: number;
}) {
  const duration = deck.loopEndSecs - deck.loopStartSecs;

  var sampler = new Sampler(outNode?.ctx, {
    sampleBuffer: deck.sampleBuffer,
  });
  var amp = new Gain(outNode?.ctx, { gain: deck.amp });
  var panner = new Panner(outNode?.ctx, { pan: deck.pan });
  var envelope = new Envelope(outNode?.ctx, {
    envelopeLength: duration * 0.99,
    playCurve: noClipCurve,
  });

  sampler.connect({ synthNode: amp, audioNode: null });
  amp.connect({ synthNode: envelope, audioNode: null });
  envelope.connect({ synthNode: panner, audioNode: null });
  panner.connect({ synthNode: outNode, audioNode: null });

  if (deck.beginPlayAtSecs && !deck.beginDelayAlreadyDone) {
    setTimeout(playAndSchedule, deck.beginPlayAtSecs * 1000);
    deck.beginDelayAlreadyDone = true;
  } else {
    playAndSchedule();
  }

  return sampler;

  function playAndSchedule() {
    // Instead of using AudioBufferSourceNode's native looping, play once
    // (so that we can use an envelope on each repeat), then schedule future
    // plays.
    sampler.play({
      startTime: 0,
      loopStart: deck.loopStartSecs,
      duration,
    });
    if (!deck.bypassEnvelope) {
      envelope.play();
    }
    deck.numberOfLoopsPlayed += 1;

    if (
      // If numberOfTimesToLoops is a number
      deck.numberOfTimesToLoop &&
      !isNaN(deck?.numberOfTimesToLoop) &&
      // and if numberOfLoopsPlayed is at least numberOfTimesToLoop
      deck.numberOfLoopsPlayed >= deck.numberOfTimesToLoop
    ) {
      // Don't schedule another play.
      return;
    }

    deck.nextPlayKey = window.setTimeout(playDeck, duration * 1000, {
      deck,
      outNode,
      deckCount,
    });
  }
}
