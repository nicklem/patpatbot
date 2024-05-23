import {readFileSync, writeFileSync} from "fs";
import {DocData, BotOutput} from "./types";
import {join} from "path";

class DocFile {
    private docData: DocData;

    constructor(docData: DocData) {
        this.docData = docData;
    }

    get data(): DocData {
        return this.docData;
    }

    update(botOutput: BotOutput) {
        this.docData = {
            ...this.docData,
            ...botOutput,
        }
    }

    save() {
        writeFileSync(this.docData.path, this.docData.description, 'utf-8');
    }

    static load(docsDir: string, patternId: string): DocFile {
        const filePath = join(docsDir, `${patternId}.md`);
        return new DocFile({
            patternId,
            tool: this.name,
            path: filePath,
            description: readFileSync(filePath, 'utf-8')
        });
    }
}

export default DocFile;
