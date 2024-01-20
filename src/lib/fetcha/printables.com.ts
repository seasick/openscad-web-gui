import { FetchaFile } from '../fetcha';

type Stl = {
  id: number;
  name: string;
  fileSize: number;
  // filePreviewPath: string; // Always empty in my tests
};

export default async function printablesComFetcha(
  url: string,
  fileNameFilter?: string
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
    `https://corsproxy.io/?${encodeURIComponent(
      'https://api.printables.com/graphql/'
    )}`,
    {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        operation: 'PrintProfile',
        'Content-Type': 'application/json',
      },
      referrer: 'https://www.printables.com/',
      body: JSON.stringify({
        operationName: 'PrintProfile',
        variables: { id, loadPurchase: false },
        query:
          'query PrintProfile($id: ID!, $loadPurchase: Boolean!) {\n  print(id: $id) {\n    ...PrintDetailFragment\n    price\n    user {\n      billingAccountType\n      lowestTierPrice\n      clubPrints {\n        ...PrintListFragment\n        __typename\n      }\n      __typename\n    }\n    purchaseDate @include(if: $loadPurchase)\n    paidPrice @include(if: $loadPurchase)\n    __typename\n  }\n}\n\nfragment PrintDetailFragment on PrintType {\n  id\n  slug\n  name\n  authorship\n  remixDescription\n  premium\n  price\n  excludeCommercialUsage\n  eduProject {\n    id\n    subject {\n      id\n      name\n      slug\n      __typename\n    }\n    language {\n      id\n      name\n      __typename\n    }\n    free\n    timeDifficulty\n    audienceAge\n    complexity\n    equipment {\n      id\n      name\n      __typename\n    }\n    suitablePrinters {\n      id\n      name\n      __typename\n    }\n    organisation\n    authors\n    targetGroupFocus\n    knowledgeAndSkills\n    objectives\n    equipmentDescription\n    timeSchedule\n    workflow\n    approved\n    datePublishRequested\n    __typename\n  }\n  user {\n    ...AvatarUserFragment\n    isFollowedByMe\n    canBeFollowed\n    email\n    publishedPrintsCount\n    premiumPrintsCount\n    designer\n    stripeAccountActive\n    membership {\n      currentTier {\n        id\n        name\n        benefits {\n          id\n          title\n          benefitType\n          description\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  ratingAvg\n  myRating\n  ratingCount\n  description\n  category {\n    id\n    path {\n      id\n      name\n      storeName\n      description\n      storeDescription\n      __typename\n    }\n    __typename\n  }\n  modified\n  firstPublish\n  datePublished\n  dateCreatedThingiverse\n  nsfw\n  summary\n  shareCount\n  likesCount\n  makesCount\n  liked\n  printDuration\n  numPieces\n  weight\n  nozzleDiameters\n  usedMaterial\n  layerHeights\n  materials {\n    id\n    name\n    __typename\n  }\n  dateFeatured\n  downloadCount\n  displayCount\n  filesCount\n  privateCollectionsCount\n  publicCollectionsCount\n  pdfFilePath\n  commentCount\n  userGcodeCount\n  remixCount\n  canBeRated\n  printer {\n    id\n    name\n    __typename\n  }\n  image {\n    ...ImageSimpleFragment\n    __typename\n  }\n  images {\n    ...ImageSimpleFragment\n    __typename\n  }\n  tags {\n    name\n    id\n    __typename\n  }\n  thingiverseLink\n  filesType\n  license {\n    id\n    disallowRemixing\n    __typename\n  }\n  remixParents {\n    ...remixParentDetail\n    __typename\n  }\n  gcodes {\n    id\n    name\n    fileSize\n    filePreviewPath\n    __typename\n  }\n  stls {\n    id\n    name\n    fileSize\n    filePreviewPath\n    __typename\n  }\n  slas {\n    id\n    name\n    fileSize\n    filePreviewPath\n    __typename\n  }\n  ...LatestCompetitionResult\n  competitions {\n    id\n    name\n    slug\n    description\n    isOpen\n    __typename\n  }\n  competitionResults {\n    placement\n    competition {\n      id\n      name\n      slug\n      printsCount\n      openFrom\n      openTo\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment AvatarUserFragment on UserType {\n  id\n  publicUsername\n  avatarFilePath\n  handle\n  company\n  verified\n  badgesProfileLevel {\n    profileLevel\n    __typename\n  }\n  __typename\n}\n\nfragment ImageSimpleFragment on PrintImageType {\n  id\n  filePath\n  rotation\n  __typename\n}\n\nfragment remixParentDetail on PrintRemixType {\n  id\n  parentPrintId\n  parentPrintName\n  parentPrintAuthor {\n    id\n    slug\n    publicUsername\n    company\n    verified\n    handle\n    __typename\n  }\n  parentPrint {\n    id\n    name\n    slug\n    datePublished\n    image {\n      ...ImageSimpleFragment\n      __typename\n    }\n    premium\n    authorship\n    license {\n      id\n      name\n      disallowRemixing\n      __typename\n    }\n    eduProject {\n      id\n      __typename\n    }\n    __typename\n  }\n  url\n  urlAuthor\n  urlImage\n  urlTitle\n  urlLicense {\n    id\n    name\n    disallowRemixing\n    __typename\n  }\n  urlLicenseText\n  __typename\n}\n\nfragment LatestCompetitionResult on PrintType {\n  latestCompetitionResult {\n    placement\n    competitionId\n    __typename\n  }\n  __typename\n}\n\nfragment PrintListFragment on PrintType {\n  id\n  name\n  slug\n  ratingAvg\n  likesCount\n  liked\n  datePublished\n  dateFeatured\n  firstPublish\n  downloadCount\n  category {\n    id\n    path {\n      id\n      name\n      __typename\n    }\n    __typename\n  }\n  modified\n  image {\n    ...ImageSimpleFragment\n    __typename\n  }\n  nsfw\n  premium\n  price\n  user {\n    ...AvatarUserFragment\n    __typename\n  }\n  ...LatestCompetitionResult\n  __typename\n}',
      }),
      method: 'POST',
      mode: 'cors',
    }
  );

  const printProfile = await printProfileResponse.json();

  // `stls` cotains an array of files available at a Printables.com model
  if (!printProfile?.data?.print?.stls?.length) {
    throw new Error('No files found');
  }

  // Iterate the stls and start getting the download links for them
  const downloadLinkPromises = printProfile.data.print.stls
    .filter((stl) => stl.name.match(fileNameFilter || '')) // Filter out files that don't match the filter
    .map((stl) => addDownloadLink(stl, id));

  // Wait for all the download links to be fetched
  const downloadLinks = await Promise.all(downloadLinkPromises);

  return downloadLinks;
}

async function addDownloadLink(stl: Stl, printId: number): Promise<FetchaFile> {
  const response = await fetch(
    `https://corsproxy.io/?${encodeURIComponent(
      'https://api.printables.com/graphql/'
    )}`,
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
          fileType: 'stl', // It doesn't matter if we use `stl` and download a .scad file
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

  const json = await response.json();

  return {
    description: `Printables.com - ${stl.fileSize} bytes`,
    name: stl.name,
    url: json.data.getDownloadLink.output.link,
  };
}
