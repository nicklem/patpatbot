import {writeFileSync} from "fs";

import {DocumentationFileData} from "./types";

class DocumentationFile {
    private readonly fileData: DocumentationFileData;

    constructor(fileData: DocumentationFileData) {
        this.fileData = fileData;
    }

    get data(): DocumentationFileData {
        return this.fileData;
    }

    update(fileContents: string) {
        writeFileSync(this.fileData.path, fileContents + '\n', 'utf-8');
    }
}

export default DocumentationFile;
