import { select } from 'd3-selection';

var numberProps = [
  'pan',
  'loopStartSecs',
  'loopEndSecs',
  'amp',
  'beginPlayAtSecs',
  'durationToPlaySecs',
];

export function renderDecks({
  decks,
  updateDeck,
  onPlayLoop,
  onStopLoop,
  onDeleteLoop,
}) {
  var deckSel = select('.decks-root')
    .selectAll('.deck')
    .data(decks, (deck) => deck.id);

  deckSel.exit().remove();

  var newDeckSel = deckSel.enter().append('li').classed('deck', true);
  var newDeckControlsSel = newDeckSel.append('ul').classed('controls', true);
  numberProps.forEach(appendControl);

  var newFileControlSel = newDeckControlsSel
    .append('li')
    .classed('control', true)
    .classed('sampleFile', true);
  newFileControlSel
    .append('label')
    .attr('for', 'sampleFile')
    .text('Sample file');
  newFileControlSel
    .append('input')
    .attr('type', 'file')
    .attr('accept', 'audio/*, .m4a,.ogg,.mp3,.wav')
    .attr('name', 'sampleFile')
    .on('change', onFileChange);
  newFileControlSel.append('div').classed('samplePath', true);

  newDeckControlsSel
    .append('li')
    .classed('control', true)
    .classed('playLoop', true)
    .append('button')
    .text('Play loop')
    .on('click', (e, deck) => onPlayLoop({ deck }));

  newDeckControlsSel
    .append('li')
    .classed('control', true)
    .classed('stopLoop', true)
    .append('button')
    .text('Stop loop')
    .on('click', (e, deck) => onStopLoop({ deck }));

  newDeckControlsSel
    .append('li')
    .classed('control', true)
    .classed('deleteLoop', true)
    .append('button')
    .text('Delete loop')
    .on('click', (e, deck) => onDeleteLoop({ deck }));

  var shouldExistDeckControlsSel = newDeckSel
    .merge(deckSel)
    .select('.controls');
  shouldExistDeckControlsSel.each(updateControls);
  shouldExistDeckControlsSel
    .select('.playLoop > button')
    .attr('disabled', (deck) =>
      deck.isPlaying || !deck.sampleBuffer ? 'disabled' : null
    );
  shouldExistDeckControlsSel
    .select('.stopLoop > button')
    .attr('disabled', (deck) => (!deck.isPlaying ? 'disabled' : null));
  shouldExistDeckControlsSel
    .select('.samplePath')
    .text((deck) => deck.samplePath ?? 'No file selected');

  function appendControl(prop) {
    var controlSel = newDeckControlsSel
      .append('li')
      .classed('control', true)
      .classed(prop, true);
    controlSel.append('label').attr('for', prop).text(prop); // TODO: Nice names.
    controlSel.append('input').attr('type', 'number').attr('name', prop);
  }

  function updateControls(deck) {
    var deckControlsRoot = select(this);
    numberProps.forEach(updateControl);

    function updateControl(prop) {
      deckControlsRoot
        .select(`.control.${prop} > input`)
        .attr('value', deck[prop])
        .on('change', onInputChange);

      function onInputChange() {
        console.log('New value', this.value);
        updateDeck({ deck, prop, value: this.value });
      }
    }
  }

  function onFileChange(e, deck) {
    if (this.files.length < 1) {
      return;
    }
    updateDeck({ deck, file: this.files[0] });
  }
}
