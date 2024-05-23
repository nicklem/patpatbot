import DocFile from './DocFile';
import logger from "./logging";
import {DocData, DocEntries, MetaDescriptions, MetaPatterns} from "./types";
import MetaFile from "./MetaFile";

class Repository {
    private readonly name: string;
    private readonly metaDescriptions: MetaFile;
    private readonly metaPatterns: MetaFile;
    private readonly docFileData: DocEntries;

    constructor(
        name: string,
        docsDir: string,
        docDescriptionPath: string,
        docPatternsPath: string,
        namePrefix: string = "codacy-"
    ) {
        this.name = namePrefix ? name.replace(namePrefix, "") : name;
        this.metaDescriptions = MetaFile.load(docDescriptionPath);
        this.metaPatterns = MetaFile.load(docPatternsPath);
        this.docFileData = this.loadDocFiles(docsDir, this.metaDescriptions.patternDescriptions);
        logger.info(`Found ${Object.keys(this.docFileData).length} documentation files.`);
    }

    get docs(): DocFile[] {
        return Object.values(this.docFileData);
    }

    updateMeta(data: DocData) {
        this.metaDescriptions.update(data);
        this.metaPatterns.update(data);
    }

    save() {
        this.docs.forEach((doc) => doc.save());
        this.metaDescriptions.save();
        this.metaPatterns.save();
    }

    private loadDocFiles(docsDir: string, docDescriptions: MetaDescriptions): DocEntries {
        return docDescriptions.reduce((acc, {patternId}) => {
            try {
                acc[patternId] = DocFile.load(docsDir, patternId);
            } catch (e) {
                logger.warn(`Couldn't load file for pattern ${patternId}`);
            }
            return acc;
        }, {});
    }
}

export default Repository;
