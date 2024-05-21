import { basename } from 'path';
import { readFileSync } from 'fs';
import { globSync } from 'glob';
import DocumentationFile from './DocumentationFile';

class Repository {
    private readonly name: string;
    private readonly docFileData: DocumentationFile[];

    constructor(name: string, docsGlob: string, replaceName: string = "codacy-") {
        this.name = replaceName ? name.replace(replaceName, "") : name;
        this.docFileData = this.loadDocFileData(docsGlob);
    }

    get docs(): DocumentationFile[] {
        return this.docFileData;
    }

    private loadDocFileData(docFilePaths: string): DocumentationFile[] {
        return globSync(docFilePaths).map(
            docFilePath => new DocumentationFile({
                tool: this.name,
                path: docFilePath,
                patternFilename: basename(docFilePath),
                patternDescription: readFileSync(docFilePath, 'utf-8')
            })
        );
    }
}

export default Repository;
