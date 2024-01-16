import printablesComFetcha from './fetcha/printables.com';

export type FetchaFile = {
  name: string;
  url: string;
};

export default async function fetcha(url: string): Promise<FetchaFile[]> {
  // Depending on the host of the url, we will use a different fetch method
  // to get the data.
  const host = new URL(url).host;

  switch (host) {
    case 'printables.com':
    case 'www.printables.com':
      return await printablesComFetcha(url, '.scad');
    default:
      throw new Error(`Unknown host ${host}`);
  }
}
