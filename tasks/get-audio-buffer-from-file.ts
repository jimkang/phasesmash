import { decodeArrayBuffer } from './decode-array-buffer';

// #throws
export async function getAudioBufferFromFile({
  file,
}: {
  file: File;
}): Promise<AudioBuffer> {
  let arrayBuffer = await file.arrayBuffer();
  return new Promise(executor);

  function executor(
    resolve: (decoded: AudioBuffer) => void,
    reject: (error: Error) => void
  ) {
    decodeArrayBuffer(arrayBuffer, done);

    function done(error: Error, decoded: AudioBuffer) {
      if (error) {
        reject(error);
        return;
      }
      resolve(decoded);
    }
  }
}
