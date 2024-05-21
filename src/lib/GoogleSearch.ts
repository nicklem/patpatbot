import axios from 'axios';
import cheerio from 'cheerio';
import Scraper from "./Scraper";

class GoogleSearch {
    private scraper: Scraper;

    constructor() {
        this.scraper = new Scraper();
    }

    async execute(query: string): Promise<string> {
        const resultUrls = await this._search(query);
        const resultData = this.scraper.scrape(resultUrls);
        return JSON.stringify(resultData);
    }

    private async _search(query: string): Promise<string[]> {
        const response = await axios.get('https://www.google.com/search', {
            params: { q: query },
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0'
            }
        });

        const $ = cheerio.load(response.data);
        const links = $('#search span>a');  // TODO This is flaky
        const resultUrls: string[] = [];
        links.each((index, element) => {
            if (index < 3) { // TODO improve this
                resultUrls.push($(element).attr('href') || '');
            }
        });

        return resultUrls;
    }
}

export default GoogleSearch;
