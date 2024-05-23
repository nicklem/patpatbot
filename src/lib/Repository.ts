import {basename} from 'path';
import {readFileSync, writeFileSync} from 'fs';
import {globSync} from 'glob';
import DocumentationFile from './DocumentationFile';
import logger from "./logging";
import {PatPatBotOutput} from "./types";

type DocDescription = {
    patternId: string,
    title: string,
    description: string
};

class Repository {
    private readonly name: string;
    private readonly docFileData: DocumentationFile[];
    private readonly docDescriptionPath: string;
    private readonly docDescriptions: Array<DocDescription>;
    private readonly docPatternsPath: string;
    private readonly docPatterns: {patterns: Array<DocDescription>};

    constructor(
        name: string,
        docsGlob: string,
        docDescriptionPath: string,
        docPatternsPath: string,
        replaceName: string = "codacy-"
    ) {
        this.name = replaceName ? name.replace(replaceName, "") : name;

        this.docDescriptionPath = docDescriptionPath;
        this.docDescriptions = JSON.parse(readFileSync(docDescriptionPath, 'utf-8'));

        this.docPatternsPath = docPatternsPath;
        this.docPatterns = JSON.parse(readFileSync(docPatternsPath, 'utf-8'));

        this.docFileData = this.loadDocFileData(docsGlob);
        logger.info(`Found ${this.docFileData.length} documentation files.`);
    }

    get docs(): DocumentationFile[] {
        return this.docFileData;
    }

    updateDoc(doc: DocumentationFile, outputData: PatPatBotOutput) {
        // Update doc file
        doc.update(outputData.description);
    }

    updateDescriptionsAndPatterns(doc: DocumentationFile, outputData: PatPatBotOutput) {
        // Update doc description in memory
        const docDescription = this.docDescriptions
            .find((d) => d.patternId === doc.data.patternId);
        if (docDescription) {
            docDescription.title = outputData.title;
            docDescription.description = outputData.summary; // This is correct. They use different keys.
        }

        // Update doc pattern in memory
        const docPattern = this.docPatterns.patterns
            .find((d) => d.patternId === doc.data.patternId);
        if (docPattern) {
            docPattern.title = outputData.title;
            docPattern.description = outputData.summary; // This is correct. They use different keys.
        }
    }

    saveDescriptionsAndPatterns() {
        writeFileSync(
            this.docDescriptionPath,
            JSON.stringify(this.docDescriptions, null, 2),
            'utf-8'
        );

        writeFileSync(
            this.docPatternsPath,
            JSON.stringify(this.docPatterns, null, 2),
            'utf-8'
        );
    }

    private loadDocFileData(docFilePaths: string): DocumentationFile[] {
        return globSync(docFilePaths).map(
            docFilePath => new DocumentationFile({
                tool: this.name,
                path: docFilePath,
                patternId: basename(docFilePath).replace('.md', ''),
                patternDescription: readFileSync(docFilePath, 'utf-8')
            })
        );
    }
}

export default Repository;
