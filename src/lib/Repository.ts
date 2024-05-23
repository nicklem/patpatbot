import {readFileSync, writeFileSync} from 'fs';
import DocFile from './DocFile';
import logger from "./logging";
import {DocData} from "./types";

type DocDescription = {
    patternId: string,
    title: string,
    description: string
};

type DocEntries = Record<string, DocFile>;

class Repository {
    private readonly name: string;
    private readonly docsDir: string;
    private readonly docDescriptionPath: string;
    private readonly docPatternsPath: string;
    private readonly docMetaDescriptions: DocDescription[];
    private readonly docMetaPatterns: {patterns: DocDescription[]};
    private readonly docFileData: DocEntries;

    constructor(
        name: string,
        docsDir: string,
        docDescriptionPath: string,
        docPatternsPath: string,
        namePrefix: string = "codacy-"
    ) {
        this.name = namePrefix ? name.replace(namePrefix, "") : name;
        this.docsDir = docsDir;
        this.docDescriptionPath = docDescriptionPath;
        this.docPatternsPath = docPatternsPath;

        this.docMetaDescriptions = this.loadMetaFileData(docDescriptionPath);
        this.docMetaPatterns = this.loadMetaFileData(docPatternsPath);
        this.docFileData = this.loadDocFiles(this.docMetaDescriptions);

        logger.info(`Found ${Object.keys(this.docFileData).length} documentation files.`);
    }

    get docs(): DocFile[] {
        return Object.values(this.docFileData);
    }

    updateMeta(data: DocData) {
        const {title, summary, patternId} = data;

        for (let descriptions of [this.docMetaDescriptions, this.docMetaPatterns.patterns]) {
            const docMeta = descriptions.find((d) => d.patternId === patternId);
            if (docMeta) {
                docMeta.title = title;
                docMeta.description = summary;
            }
        }
    }

    save() {
        this.saveDocFiles();
        this.saveMetaFiles();
    }

    saveMetaFiles() {
        this.saveMetaFile(this.docDescriptionPath, this.docMetaDescriptions);
        this.saveMetaFile(this.docPatternsPath, this.docMetaPatterns);
    }

    private saveDocFiles() {
        this.docs.forEach((doc) => doc.save());
    }

    private loadDocFiles(docDescriptions: DocDescription[]): DocEntries {
        return docDescriptions.reduce((acc, {patternId}) => {
            try {
                acc[patternId] = DocFile.load(this.docsDir, patternId);
            } catch (e) {
                logger.warn(`Couldn't load file for pattern ${patternId}`);
            }
            return acc;
        }, {});
    }

    private loadMetaFileData(path: string) {
        return JSON.parse(readFileSync(path, 'utf-8'));
    }

    private saveMetaFile(path: string, data: any) {
        writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
    }
}

export default Repository;
