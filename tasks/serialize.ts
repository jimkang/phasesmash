import { LoopDeck } from '../types';
import { getAudioBufferFromFilePath } from './get-audio-buffer-from-file';

export var unserializableKeys = [
  'sampleBuffer',
  'samplerNode',
  'isPlaying',
  'beginDelayAlreadyDone',
  'numberOfLoopsPlayed',
];

export function serializeDecks({
  decks,
  niceFormatting,
}: {
  decks: LoopDeck[];
  niceFormatting?: boolean;
}) {
  var serializableDecks = decks.map(getSerializableDeck);
  if (niceFormatting) {
    return JSON.stringify(serializableDecks, null, 2);
  }

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
  deck.numberOfLoopsPlayed = 0;
  return deck;
}
