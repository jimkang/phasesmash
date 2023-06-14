import OLPE from 'one-listener-per-element';

var { on } = OLPE();

export function wireMainControls({
  onAddLoop,
}) {
  on('#add-loop-deck-button', 'click', onAddLoop);
}
