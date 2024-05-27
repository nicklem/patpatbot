import axios from 'axios';
import * as cheerio from 'cheerio';
import format from 'string-format';
import {FlatObject, IQueryable} from "./types";
import PromptTemplate from "./PromptTemplate";
import {CheerioWebBaseLoader} from "@langchain/community/document_loaders/web/cheerio";
class GoogleSearch {
    async execute(
        promptTemplate: PromptTemplate,
        promptData: FlatObject = {},
    ): Promise<{output: string[]}> {
        const query = format(promptTemplate.promptHuman, promptData);
        const resultUrls = await this.getSerpUrls(query);
        const scrapedResults = await this.scrapeResults(resultUrls);
        return {output: scrapedResults};
        // return promptTemplate.formatOutput(scrapedResults);
    }

    private async getSerpUrls(q: string): Promise<string[]> {
        const response = await axios.get(
            'https://www.google.com/search',
            {
                params: { q, hl: 'en' },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0'
                }
            }
        );

        const $ = cheerio.load(response.data);

        return $('#search span>a')  // TODO This is flaky
            .toArray()
            .slice(0, 10)
            .map((element) => $(element).attr('href'));
    }

    private async scrapeResults(urls: string[]): Promise<string[]> {
        const tasks = urls.map(this.getContent);
        return await Promise.all(tasks);
            // .map(result => `***SEARCH RESULT***:${result}***END SEARCH RESULT***`)
            // .join('\n');
    }

    private async getContent(url: string): Promise<any> {
        const loader = new CheerioWebBaseLoader(url, {selector: "p"});
        const document = await loader.load();
        return document
            .map(({pageContent}) => pageContent)
            .join('\n')
            // TODO some results are way too long. Simply truncating for now.
            .slice(0, 25000);
    }
}

export default GoogleSearch;
