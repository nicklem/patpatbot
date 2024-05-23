import PatPatBot from "./PatPatBot";
import Gpt from "./Gpt";
import {API_KEY_OPENAI, DOC_DESCRIPTIONS_PATH, DOC_PATTERNS_PATH, DOCS_DIR, REPO_NAME} from "./init";
import GoogleSearch from "./GoogleSearch";
import Repository from "./Repository";
import logger from "./logging";

class Action {
    static async run() {
        const bot = new PatPatBot(
            new Gpt(API_KEY_OPENAI),
            new GoogleSearch()
        );

        const repo = new Repository(
            REPO_NAME,
            DOCS_DIR,
            DOC_DESCRIPTIONS_PATH,
            DOC_PATTERNS_PATH,
        );

        const maxIdx = Math.min(repo.docs.length, 3); // TODO remove this
        for (let idx = 0; idx < maxIdx; idx++) {
            let doc = repo.docs[idx];
            logger.info(`Processing pattern ${idx + 1} of ${repo.docs.length}: %o`, doc.data.patternId);
            const botOutput = await bot.processDoc(doc.data);
            doc.update(botOutput)
            repo.updateMeta(doc.data);
        }

        repo.save();
        logger.info('Done!');
    }
}

export default Action;
