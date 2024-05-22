import {writeFileSync} from "fs";

import {DocumentationFileData, PatPatBotOutput} from "./types";

class DocumentationFile {
    private readonly fileData: DocumentationFileData;
    private readonly fileDataPrefixed: Record<string, string>;

    constructor(fileData: DocumentationFileData, keyPrefix="input__") {
        this.fileData = fileData;
        this.fileDataPrefixed = Object.entries(fileData).reduce((acc, [key, value]) => {
            acc[keyPrefix + snakeCase(key)] = value;
            return acc;
        }, {});
    }

    get data(): Record<string, string> {
        return this.fileDataPrefixed;
    }

    update(fileContents: string) {
        writeFileSync(this.fileData.path, fileContents, 'utf-8');
    }
}

const snakeCase = (str: string) => str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();

export default DocumentationFile;
