import { LoopDeck } from '../types';
import { getAudioBufferFromFilePath } from './get-audio-buffer-from-file';

var unserializableKeys = ['sampleBuffer', 'samplerNode', 'isPlaying'];
export function serializeDecks({ decks }: { decks: LoopDeck[] }) {
  var serializableDecks = decks.map(getSerializableDeck);
  return JSON.stringify(serializableDecks);
}

function getSerializableDeck(deck: LoopDeck) {
  var sd: Record<string, unknown> = {};
  for (let key in deck) {
    if (unserializableKeys.includes(key)) {
      continue;
    }
    sd[key] = deck[key];
  }
  return sd;
}

// #throws
export function deserializeDecks({ serialized }: { serialized: string }) {
  var deckObjects = JSON.parse(serialized);
  return Promise.all(deckObjects.map(getDeckFromDeserializedObject));
}

async function getDeckFromDeserializedObject(deckObject: unknown) {
  var deck: LoopDeck = deckObject as LoopDeck;
  if (deck.samplePath) {
    deck.sampleBuffer = await getAudioBufferFromFilePath({
      filePath: deck.samplePath,
    });
  }
  return deck;
}
