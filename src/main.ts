import {ENV_OPENAI_API_KEY, ENV_REPO_NAME, ENV_DOCS_GLOB} from "./lib/init";
import GoogleSearch from "./lib/GoogleSearch";
import Gpt from "./lib/Gpt";
import PatPatBot from "./lib/PatPatBot";
import Repository from "./lib/Repository";

function run() {
    const bot = new PatPatBot(new Gpt(ENV_OPENAI_API_KEY), new GoogleSearch());
    const repo = new Repository(ENV_REPO_NAME, ENV_DOCS_GLOB);

    repo.docs.slice(0, 1).map(doc => { // TODO remove slice
        bot.setSourceDocData(doc);
        bot.processSourceDoc().then(() => {
            console.log(bot.getPromptDatum('examine'));
        });
    })
}

run();
