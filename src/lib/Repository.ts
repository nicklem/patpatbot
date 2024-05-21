import { basename } from 'path';
import { readFileSync } from 'fs';
import { globSync } from 'glob';
import DocFileData from './DocFileData';

class Repository {
    private readonly name: string;
    private readonly docFileData: DocFileData[];

    constructor(name: string, docsGlob: string, replaceName: string = "codacy-") {
        this.name = replaceName ? name.replace(replaceName, "") : name;
        this.docFileData = this.loadDocFileData(docsGlob);
    }

    get docs(): DocFileData[] {
        return this.docFileData;
    }

    static fromSettings(name: string, docsGlob: string): Repository {
        return new Repository(name, docsGlob);
    }

    private loadDocFileData(docsGlob: string): DocFileData[] {
        return globSync(docsGlob).map(doc => new DocFileData(
            this.name,
            doc,
            basename(doc),
            readFileSync(doc, 'utf-8')
        ));
    }

    static repoNameFromUrl(url: string): string {
        const match = url.match(/.*\/(.*)\.git/);
        return match ? match[1] : '';
    }
}

export default Repository;
