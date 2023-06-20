import { Gain } from './synth-node';

export function MainOut({ ctx }) {
  var mainOutNode = new Gain(ctx, { gain: 1.0 });
  mainOutNode.connect({ synthNode: null, audioNode: ctx.destination });
  return mainOutNode;
}
