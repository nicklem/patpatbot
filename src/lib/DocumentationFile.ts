type DocumentationFileData = {
    tool: string;
    path: string;
    patternFilename: string;
    patternDescription: string;
};

const snakeCase = (str: string) => str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();

class DocumentationFile {
    private readonly fileData: Record<string, string>;

    constructor(fileData: DocumentationFileData, keyPrefix="init__") {
        this.fileData = Object.entries(fileData).reduce((acc, [key, value]) => {
            acc[keyPrefix + snakeCase(key)] = value;
            return acc;
        }, {});
    }

    get data(): Record<string, string> {
        return this.fileData;
    }
}

export default DocumentationFile;
