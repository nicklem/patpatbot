import {readFileSync, writeFileSync} from "fs";
import {DocData, MetaData, MetaDescriptions, MetaPatterns} from "./types";

class MetaFile {
    private readonly path: string;
    private readonly fileData: MetaData;

    constructor(path: string, fileData: MetaData) {
        this.path = path;
        this.fileData = fileData;
    }

    static load(path: string) {
        return new MetaFile(
            path,
            JSON.parse(readFileSync(path, 'utf-8'))
        );
    }

    update(data: DocData) {
        const {title, summary, patternId, updatedDate} = data;
        const docMeta = this.patternDescriptions
            .find((d) => d.patternId === patternId);
        if (docMeta) {
            docMeta.title = title;
            docMeta.description = summary;
            docMeta.patPatBotReviewed = updatedDate;
        }
    }

    save() {
        writeFileSync(this.path, JSON.stringify(this.fileData, null, 2), 'utf-8');
    }

    get patternDescriptions(): MetaDescriptions {
        return this.fileData.hasOwnProperty('patterns')
            ? (this.fileData as MetaPatterns).patterns
            : (this.fileData as MetaDescriptions);
    }
}

export default MetaFile;
