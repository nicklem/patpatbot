import axios from 'axios';
import * as cheerio from 'cheerio';
import format from 'string-format';
import {IQueryable, FlatObject} from "./types";
import PromptTemplate from "./PromptTemplate";

class GoogleSearch implements IQueryable {
    async execute(
        promptTemplate: PromptTemplate,
        promptData: FlatObject = {},
    ): Promise<FlatObject> {
        const query = format(promptTemplate.promptHuman, promptData);
        const resultUrls = await this.getSerpUrls(query);
        const scrapedResults = await this.scrapeResults(resultUrls);
        return promptTemplate.formatOutput(scrapedResults);
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
            .map((element) => $(element).attr('href'));
    }

    private async scrapeResults(urls: string[]): Promise<string> {
        const tasks = urls.map(this.getAndParse);
        const results = await Promise.all(tasks);

        return results
            .map(result => `***SEARCH RESULT***:${result}***END SEARCH RESULT***`)
            .join('\n');
    }

    private async getAndParse(url: string): Promise<string> {
        try {
            const response = await axios.get(url);
            return this.extractData(response.data);
        } catch (error) {
            return ""; // Ignore HTTP errors while scraping.
        }
    }

    private extractData(html: string): string {
        const $ = cheerio.load(html);
        const output = $('p').text();

        // TODO some results are way too long. Simply truncating for now.
        return output.slice(0, 25000);
    }
}

export default GoogleSearch;
