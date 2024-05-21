class DocFileData {
    path: string;
    tool: string;
    patternFilename: string;
    patternDescription: string;

    constructor(tool: string, path: string, patternFilename: string, patternDescription: string) {
        this.tool = tool;
        this.path = path;
        this.patternFilename = patternFilename;
        this.patternDescription = patternDescription;
    }

    toDict(keyPrefix = "init__"): { [key: string]: any } {
        const output: { [key: string]: any } = {};
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                const snakeCaseKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
                output[keyPrefix + snakeCaseKey] = this[key];
            }
        }
        return output;
    }
}

export default DocFileData;
