import OLPE from 'one-listener-per-element';

var { on } = OLPE();

export function wireMainControls({
  onAddLoop,
  onPlayAll,
  onStopAll,
  onImportClick,
  onExportClick,
}) {
  on('#add-loop-deck-button', 'click', onAddLoop);
  on('#play-all-button', 'click', onPlayAll);
  on('#stop-all-button', 'click', onStopAll);
  on('#import-decks-button', 'click', onImportClick);
  on('#export-decks-button', 'click', onExportClick);
}
