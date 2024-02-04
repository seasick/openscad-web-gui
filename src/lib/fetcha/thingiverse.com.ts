import { FetchaFile } from '../fetcha';

export default async function thingiverseComFetcha(
  url: string,
  fileNameFilter?: { [Symbol.match](string: string): RegExpMatchArray | null }
): Promise<FetchaFile[]> {
  // Url is expected to look like `https://www.thingiverse.com/thing:2523187`.
  // We need to extract the id from the url, which is `2523187` in this case.
  const idString = url.match(/\/thing:(\d+)/)?.[1];

  // Download the current app bundle which contains a bearer token.
  const appBundleResponse = await fetch(
    'https://cdn.thingiverse.com/site/js/app.bundle.js'
  );
  const appBundle = await appBundleResponse.text();

  // The app bundle contains minified code, and at the time of writing this comment, the token
  // is located in a `u="<token>"` string. The closest identifiable string before that definition
  // is `https://tv-zip.thingiverse.com`. So we could search for that string and then search fowards
  // for the token. *But* also at the time of writing, it was the only 32char long a-z0-9 string in
  // the entire app bundle. So we can just search for that.

  /* const tokenStart = appBundle.indexOf('https://tv-zip.thingiverse.com');
  const searchPart = appBundle.substring(tokenStart);
  const token = searchPart.match(/u="([a-f0-9]{32})"/)?.[1];*/

  const token = appBundle.match(/="([a-f0-9]{32})"/)?.[1];

  // With the token we can now get the list of files
  const thingResponse = await fetch(
    '__CORSPROXY' + `https://api.thingiverse.com/things/${idString}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const thing = await thingResponse.json();

  return thing.zip_data.files
    .filter((file) => file.name.match(fileNameFilter || ''))
    .map((file) => ({
      description: '',
      name: file.name,
      url: file.url,
    }));
}
