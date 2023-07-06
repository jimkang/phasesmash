/* global electronDialog */
import './app.css';
import RouteState from 'route-state';
import handleError from 'handle-error-web';
import { version } from './package.json';
import ContextKeeper from 'audio-context-singleton';
import { wireMainControls } from './renderers/wire-controls';
import seedrandom from 'seedrandom';
import RandomId from '@jimkang/randomid';
import { createProbable as Probable } from 'probable';
import ep from 'errorback-promise';
import { LoopDeck } from './types';
import { renderDecks } from './renderers/render-decks';
import { getAudioBufferFromFile } from './tasks/get-audio-buffer-from-file';
import { MainOut } from './synths/main-out';
import { playDeck } from './tasks/play-deck';
import { SynthNode } from './synths/synth-node';
import {
  exportDecks,
  importDecks,
  loadDecks,
  saveDecks,
} from './updaters/saving-and-loading';

var deckSetFileFilters = [
  { name: 'Loop deck set files', extensions: ['json'] },
];

var randomId = RandomId();
var routeState: {
  routeFromHash: () => void;
  addToRoute: (arg0: { seed: string }) => void;
};
var { getCurrentContext } = ContextKeeper();
var prob;
var decks: LoopDeck[] = [];

(async function go() {
  window.addEventListener('error', reportTopLevelError);
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

  var loadedDecks = await loadDecks();
  if (loadedDecks) {
    decks = loadedDecks;
    passStateToRenderDecks();
  }

  var mainOut: SynthNode;

  var random = seedrandom(seed);
  prob = Probable({ random });
  prob.roll(2);

  wireMainControls({
    onAddLoop,
    onPlayAll,
    onStopAll,
    onImportClick,
    onExportClick,
  });

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

  function onPlayAll() {
    // We don't need to wait for these promises to resolve.
    decks.forEach((deck) => onPlayLoop({ deck }));
  }

  function onStopAll() {
    decks.forEach((deck) => onStopLoop({ deck }));
  }

  async function onImportClick() {
    try {
      var { canceled, filePaths } = await electronDialog.showOpenDialog({
        title: 'Pick a deck set file',
        filters: deckSetFileFilters,
        properties: ['openFile'],
      });
      if (!canceled && filePaths && filePaths.length > 0) {
        let loadedDecks = await importDecks({ filePath: filePaths[0] });
        if (loadedDecks) {
          decks = loadedDecks;
          passStateToRenderDecks();
        }
      }
    } catch (error) {
      handleError(error);
    }
  }

  async function onExportClick() {
    try {
      var { canceled, filePath } = await electronDialog.showSaveDialog({
        title: 'Save deck set to this file',
        filters: deckSetFileFilters,
      });
      if (!canceled) {
        exportDecks({ filePath });
        // TODO: Notify about export success.
      }
    } catch (error) {
      handleError(error);
    }
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
  }): Promise<void> {
    if (file) {
      try {
        deck.samplePath = file.path;
        deck.sampleBuffer = await getAudioBufferFromFile({ file });
      } catch (error) {
        handleError(error);
      }
    }
    if (prop) {
      deck[prop as string] = value;
    }

    passStateToRenderDecks();
    saveDecks(decks);
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

  async function onDeleteLoop({ deck }: { deck: LoopDeck }) {
    deck?.samplerNode?.stop();
    const deleteIndex = decks.findIndex(
      (deckToCheck) => deckToCheck.id === deck.id
    );
    decks.splice(deleteIndex, 1);
    saveDecks(decks);
    passStateToRenderDecks();
  }

  function passStateToRenderDecks() {
    renderDecks({ decks, updateDeck, onPlayLoop, onStopLoop, onDeleteLoop });
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

function reportTopLevelError(event: ErrorEvent) {
  handleError(event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info') as HTMLElement;
  versionInfo.textContent = version;
}
