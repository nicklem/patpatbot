import axios from 'axios';
import * as cheerio from 'cheerio';

class Scraper {
    async scrape(urls: string[]): Promise<string[]> {
        const tasks = urls.map(url => this.fetchAndParse(url));
        return Promise.all(tasks);
    }

    private async fetchAndParse(url: string): Promise<string> {
        let html = "";
        try {
            html = await this.fetch(url);
        } catch (error) {
            // TODO: Log this error
            console.error(`Error fetching ${url}: ${error}`)
        }
        return this.parseHtml(html);
    }

    private async fetch(url: string): Promise<string> {
        const response = await axios.get(url);
        return response.data;
    }

    private parseHtml(html: string): string {
        const $ = cheerio.load(html);
        return $('p').text();
    }
}

export default Scraper;
