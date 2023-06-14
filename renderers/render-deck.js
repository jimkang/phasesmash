import { select } from 'd3-selection';

var numberProps = ['pan', 'loopStartSecs', 'loopEndSecs', 'amp'];
export function renderDecks({ decks }) {
  var deckSel = select('.decks-root')
    .selectAll('.deck')
    .data(decks, (deck) => deck.id);

  deckSel.exit().remove();

  var newDeckSel = deckSel.enter().append('li').classed('deck', true);
  var newDeckControlsSel = newDeckSel.append('ul').classed('controls', true);
  numberProps.forEach(appendControl);

  var shouldExistDeckControlsSel = newDeckSel
    .merge(deckSel)
    .select('.controls');
  shouldExistDeckControlsSel.each(updateControls);

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
        .attr('value', deck[prop]);
    }
  }
}
