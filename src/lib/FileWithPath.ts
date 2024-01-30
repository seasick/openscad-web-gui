export default class FileWithPath extends File {
  public path?: string;

  constructor(
    fileBits: BlobPart[],
    fileName: string,
    options?: FilePropertyBag & { path?: string }
  ) {
    super(fileBits, fileName, options);

    this.path = options?.path || fileName;
  }
}
