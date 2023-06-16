import './app.css';
import RouteState from 'route-state';
import handleError from 'handle-error-web';
import { version } from './package.json';
import ContextKeeper from 'audio-context-singleton';
import { wireMainControls } from './renderers/wire-controls';
import seedrandom from 'seedrandom';
import RandomId from '@jimkang/randomid';
import { createProbable as Probable } from 'probable';
import { tonalityDiamondPitches } from './tonality-diamond';
import { interpolateValueWithTick } from './tasks/interpolate-with-tick';
import ep from 'errorback-promise';
import { LoopDeck } from './types';
import { renderDecks } from './renderers/render-decks';
import { getAudioBufferFromFile } from './tasks/get-audio-buffer-from-file';

var randomId = RandomId();
var routeState: {
  routeFromHash: () => void;
  addToRoute: (arg0: { seed: any }) => void;
};
var { getCurrentContext } = ContextKeeper();
var prob;
var decks: LoopDeck[] = [];

(async function go() {
  window.onerror = reportTopLevelError;
  renderVersion();

  routeState = RouteState({
    followRoute,
    windowObject: window,
    // propsToCoerceToBool: ['enableFeedback'],
  });
  routeState.routeFromHash();
})();

async function followRoute({ seed }: { seed: string }) {
  if (!seed) {
    routeState.addToRoute({ seed: randomId(8) });
    return;
  }

  // var { error, values } = await ep(getCurrentContext);
  // if (error) {
  //   handleError(error);
  //   return;
  // }

  // var ctx = values[0];

  var random = seedrandom(seed);
  prob = Probable({ random });
  prob.roll(2);

  wireMainControls({ onAddLoop });

  function onAddLoop() {
    console.log('hey');
    decks.push({
      id: 'deck-' + randomId(4),
      pan: 0,
      loopStartSecs: 0,
      loopEndSecs: 10,
      amp: 1.0,
    });
    renderDecks({ decks, onNewDeckFile, onPlayLoop });
  }

  async function onNewDeckFile({ deck, file }: { deck: LoopDeck; file: File }) {
    try {
      deck.sampleBuffer = await getAudioBufferFromFile({ file });
      renderDecks({ decks, onNewDeckFile, onPlayLoop });
    } catch (error) {
      handleError(error);
    }
  }

  function onPlayLoop({ deck }) {
    console.log('play', deck);
  }
}

function reportTopLevelError(
  _msg: any,
  _url: any,
  _lineNo: any,
  _columnNo: any,
  error: any
) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info') as HTMLElement;
  versionInfo.textContent = version;
}
