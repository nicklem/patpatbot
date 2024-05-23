import axios from 'axios';
import * as cheerio from 'cheerio';
import Scraper from "./Scraper";
import format from 'string-format';
import {IQueryable, PlainObject} from "./types";
import logger from "./logging";

class GoogleSearch implements IQueryable {
    constructor(
        private readonly scraper: Scraper = new Scraper()
    ) {}

    async execute(
        promptHuman: string,
        promptData: PlainObject = {},
    ): Promise<string> {
        const query = format(promptHuman, promptData);
        const resultUrls = await this.search(query);
        const resultData = await this.scraper.scrape(resultUrls);
        return JSON.stringify(resultData);
    }

    private async search(q: string): Promise<string[]> {
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
}

export default GoogleSearch;
