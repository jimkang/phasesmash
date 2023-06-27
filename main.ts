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
import { MainOut } from './synths/main-out';
import { playDeck } from './tasks/play-deck';
import { SynthNode } from './synths/synth-node';

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

  var mainOut: SynthNode;

  var random = seedrandom(seed);
  prob = Probable({ random });
  prob.roll(2);

  wireMainControls({ onAddLoop });

  function onAddLoop() {
    decks.push({
      id: 'deck-' + randomId(4),
      pan: 0,
      loopStartSecs: 0,
      loopEndSecs: 10,
      amp: 1.0,
    });

    passStateToRenderDecks();
  }

  async function updateDeck({
    deck,
    file,
    prop,
    value,
  }: {
    deck: LoopDeck;
    file?: File;
    prop?: string;
    value?: string | number | AudioBuffer | undefined;
  }) {
    if (file) {
      try {
        deck.sampleBuffer = await getAudioBufferFromFile({ file });
      } catch (error) {
        handleError(error);
      }
    }
    if (prop) {
      deck[prop as string] = value;
    }

    passStateToRenderDecks();
  }

  async function onPlayLoop({ deck }: { deck: LoopDeck }) {
    deck.samplerNode = playDeck({ deck, outNode: await getMainOut() });
    deck.isPlaying = true;
    passStateToRenderDecks();
  }

  async function onStopLoop({ deck }: { deck: LoopDeck }) {
    deck.isPlaying = false;
    deck?.samplerNode?.stop();
    passStateToRenderDecks();
  }

  function passStateToRenderDecks() {
    renderDecks({ decks, updateDeck, onPlayLoop, onStopLoop });
  }

  async function getMainOut() {
    if (mainOut) {
      return mainOut;
    }

    var { error, values } = await ep(getCurrentContext);
    if (error) {
      handleError(error);
      return;
    }
    var ctx = values[0];
    mainOut = MainOut({ ctx });
    return mainOut;
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
