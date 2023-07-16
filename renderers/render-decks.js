import { select } from 'd3-selection';

var numberProps = [
  'pan',
  'loopStartSecs',
  'loopEndSecs',
  'amp',
  'beginPlayAtSecs',
  'numberOfTimesToLoop',
];

export function renderDecks({
  decks,
  updateDeck,
  onPlayLoop,
  onStopLoop,
  onDeleteLoop,
  onDuplicateLoop,
}) {
  var deckSel = select('.decks-root')
    .selectAll('.deck')
    .data(decks, (deck) => deck.id);

  deckSel.exit().remove();

  var newDeckSel = deckSel.enter().append('li').classed('deck', true);
  var newDeckControlsSel = newDeckSel.append('ul').classed('controls', true);
  numberProps.forEach(appendControl);

  var checkContainerSel = newDeckControlsSel
    .append('li')
    .classed('control', true)
    .classed('bypassEnvelope', true);
  checkContainerSel
    .append('label')
    .attr('for', 'bypassEnvelope')
    .text('bypassEnvelope');
  checkContainerSel
    .append('input')
    .attr('type', 'checkbox')
    .attr('name', 'bypassEnvelope');

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

  var newButtonPaneSel = newDeckControlsSel
    .append('div')
    .classed('button-pane', true);

  addButton({
    parentSel: newButtonPaneSel,
    cssClass: 'playLoop',
    text: 'Play loop',
    onClick: onPlayLoop,
  });
  addButton({
    parentSel: newButtonPaneSel,
    cssClass: 'stopLoop',
    text: 'Stop loop',
    onClick: onStopLoop,
  });
  addButton({
    parentSel: newButtonPaneSel,
    cssClass: 'deleteLoop',
    text: 'Delete loop',
    onClick: onDeleteLoop,
  });
  addButton({
    parentSel: newButtonPaneSel,
    cssClass: 'duplicateLoop',
    text: 'Duplicate loop',
    onClick: onDuplicateLoop,
  });

  var shouldExistDeckControlsSel = newDeckSel
    .merge(deckSel)
    .select('.controls');
  shouldExistDeckControlsSel.each(updateControls);

  var bypassEnvelopeInput = shouldExistDeckControlsSel.select(
    '.bypassEnvelope input'
  );
  bypassEnvelopeInput.each(updateBypassEnvelopeInput);

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

  function updateBypassEnvelopeInput(deck) {
    this.checked = !!deck.bypassEnvelope;

    select(this).on('change', (e, deck) =>
      updateDeck({ deck, prop: 'bypassEnvelope', value: this.checked })
    );
  }

  function onFileChange(e, deck) {
    if (this.files.length < 1) {
      return;
    }
    updateDeck({ deck, file: this.files[0] });
  }
}

function addButton({ parentSel, cssClass, text, onClick }) {
  parentSel
    .append('li')
    .classed('control', true)
    .classed(cssClass, true)
    .append('button')
    .text(text)
    .on('click', (e, deck) => onClick({ deck }));
}
