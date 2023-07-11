import { Gain } from './synth-node';

export function MainOut({ ctx }) {
  var mainOutNode = new Gain(ctx, { gain: 1.0 });
  mainOutNode.connect({ synthNode: null, audioNode: ctx.destination });
  var compressor = new DynamicsCompressorNode(ctx, {
    threshold: -6,
    ratio: 2,
    attack: 0.001,
  });
  mainOutNode.connect({ synthNode: null, audioNode: compressor });
  compressor.connect(ctx.destination);
  return mainOutNode;
}
