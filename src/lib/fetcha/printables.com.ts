import { FetchaFile } from '../fetcha';

type Stl = {
  id: number;
  name: string;
  fileSize: number;
  // filePreviewPath: string; // Always empty in my tests
};

export default async function printablesComFetcha(
  url: string,
  fileNameFilter?: { [Symbol.match](string: string): RegExpMatchArray | null }
): Promise<FetchaFile[]> {
  // Url is expected to look like https://www.printables.com/model/123456-some-optional-string-after
  // We need to extract the id from the url, which is 123456 in this case. The url could also contain
  // `/comments/` or `/remixes/` at the end.
  const idString = url.match(/\/model\/(\d+)/)?.[1];

  if (!idString) {
    throw new Error('No id found in url');
  }

  const id: number = parseInt(idString, 10);

  const printProfileResponse = await fetch(
    `__CORSPROXY${'https://api.printables.com/graphql/'}`,
    {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        operation: 'PrintProfile',
        'Content-Type': 'application/json',
      },
      referrer: 'https://www.printables.com/',
      body: JSON.stringify({
        operationName: 'PrintFiles',
        variables: { id },
        query:
          'query PrintFiles($id: ID!) {  print(id: $id) {    id    authorship    remixDescription    premium    price    user {      id      handle      __typename    }    image {      ...ImageSimpleFragment      __typename    }    images {      ...ImageSimpleFragment      __typename    }    eduProject {      id      free      __typename    }    gcodes {      id      name      folder      note      filePreviewPath      fileSize      created      nozzleDiameter      printDuration      layerHeight      material {        id        name        __typename      }      weight      printer {        id        name        __typename      }      excludeFromTotalSum      __typename    }    stls {      id      name      folder      note      created      fileSize      filePreviewPath      __typename    }    slas {      id      name      folder      note      created      fileSize      filePreviewPath      printDuration      layerHeight      usedMaterial      expTime      firstExpTime      printer {        id        name        __typename      }      __typename    }    otherFiles {      id      name      folder      note      created      fileSize      __typename    }    downloadPacks {      id      name      fileSize      fileType      __typename    }    license {      id      name      content      __typename    }    thingiverseLink    filesType    remixParents {      ...remixParentDetail      __typename    }    __typename  }}fragment ImageSimpleFragment on PrintImageType {  id  filePath  rotation  __typename}fragment remixParentDetail on PrintRemixType {  id  parentPrintId  parentPrintName  parentPrintAuthor {    id    slug    publicUsername    company    verified    handle    __typename  }  parentPrint {    id    name    slug    datePublished    image {      ...ImageSimpleFragment      __typename    }    premium    authorship    license {      id      name      disallowRemixing      __typename    }    eduProject {      id      __typename    }    __typename  }  url  urlAuthor  urlImage  urlTitle  urlLicense {    id    name    disallowRemixing    __typename  }  urlLicenseText  __typename}',
      }),
      method: 'POST',
      mode: 'cors',
    }
  );

  if (!printProfileResponse.ok) {
    throw new Error(
      'Failed to get printables.com model information, response status code was ' +
        printProfileResponse.status
    );
  }

  const printProfile = await printProfileResponse.json();

  // `stls` cotains an array of files available at a Printables.com model
  if (
    !printProfile?.data?.print?.stls?.length &&
    !printProfile?.data?.print?.otherFiles?.length
  ) {
    throw new Error('No files found');
  }

  // Iterate the stls and start getting the download links for them
  const downloadLinkPromises = [
    ...printProfile.data.print.stls,
    ...printProfile.data.print.otherFiles,
  ]
    .filter((stl) => {
      return stl.name.match(fileNameFilter || '');
    }) // Filter out files that don't match the filter
    .map((stl) =>
      addDownloadLink(stl, id, stl.__typename === 'STLType' ? 'stl' : 'other')
    );

  // Wait for all the download links to be fetched
  const downloadLinks = await Promise.all(downloadLinkPromises);

  return downloadLinks;
}

async function addDownloadLink(
  stl: Stl,
  printId: number,
  fileType: string
): Promise<FetchaFile> {
  const response = await fetch(
    `__CORSPROXY${'https://api.printables.com/graphql/'}`,
    {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        'Content-Type': 'application/json',
        operation: 'GetDownloadLink',
      },
      body: JSON.stringify({
        operationName: 'GetDownloadLink',
        variables: {
          id: stl.id,
          fileType,
          printId,
          source: 'model_detail',
        },
        query:
          'mutation GetDownloadLink($id: ID!, $printId: ID!, $fileType: DownloadFileTypeEnum!, $source: DownloadSourceEnum!) {\n  getDownloadLink(\n    id: $id\n    printId: $printId\n    fileType: $fileType\n    source: $source\n  ) {\n    ok\n    errors {\n      field\n      messages\n      __typename\n    }\n    output {\n      link\n      count\n      ttl\n      __typename\n    }\n    __typename\n  }\n}',
      }),
      method: 'POST',
      mode: 'cors',
    }
  );

  if (!response.ok) {
    throw new Error(
      'Failed to get printables.com download link, response status code was ' +
        response.status
    );
  }

  const json = await response.json();

  return {
    description: `Printables.com - ${stl.fileSize} bytes`,
    name: stl.name,
    url: json.data.getDownloadLink.output.link,
  };
}
