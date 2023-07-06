import { deserializeDecks, serializeDecks } from '../tasks/serialize';
import handleError from 'handle-error-web';
import { LoopDeck } from '../types';

export function saveDecks(decks: LoopDeck[]) {
  localStorage.decks = serializeDecks({ decks });
}

export async function loadDecks(): Promise<LoopDeck[] | undefined> {
  if (localStorage.decks) {
    try {
      return await deserializeDecks({ serialized: localStorage.decks });
    } catch (error) {
      // TODO: Dialog about not being able to deserialize.
      handleError(error);
      // delete localStorage.decks;
    }
  }
}

export function exportDecks({ filePath }: { filePath: string }) {
  if (localStorage.decks) {
    // A li'l ridiculous to parse then re-serialize, but:
    // - We want the JSON string to be formatted nicely for export.
    // - We want the JSON string to NOT be formatted nicely (we want it compact)
    // for localStorage.
    const serialized = serializeDecks({
      decks: JSON.parse(localStorage.decks),
      niceFormatting: true,
    });
    return fsPromises.writeFile(filePath, serialized);
  }
}

export async function importDecks({ filePath }: { filePath: string }) {
  const serializedNice = await fsPromises.readFile(filePath, {
    encoding: 'utf8',
  });
  // Store it in compact, "unformatted" JSON.
  localStorage.decks = JSON.stringify(JSON.parse(serializedNice));
  return loadDecks();
}
