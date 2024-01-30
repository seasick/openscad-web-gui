import printablesComFetcha from './fetcha/printables.com';
import thingiverseComFetcha from './fetcha/thingiverse.com';

export type FetchaFile = {
  name: string;
  url: string;
  description?: string;
};

export default async function fetcha(url: string): Promise<FetchaFile[]> {
  // Depending on the host of the url, we will use a different fetch method
  // to extract the download url(s).
  const host = new URL(url).host;
  const excludeStlRegex = /\.(?!stl)(?!3mf).*$/;

  switch (host) {
    // Printables
    case 'printables.com':
    case 'www.printables.com':
      return await printablesComFetcha(url, excludeStlRegex);

    // Thingiverse
    case 'thingiverse.com':
    case 'www.thingiverse.com':
      return await thingiverseComFetcha(url, excludeStlRegex);
    default: {
      const urlParts = url.split('/');

      let fileName = 'unknown';
      if (urlParts.length > 0) {
        fileName = urlParts[urlParts.length - 1];
      }

      return [
        {
          name: fileName,
          url: '__CORSPROXY' + url,
        },
      ];
    }
  }
}
