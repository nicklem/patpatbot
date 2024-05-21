import axios from 'axios';
import * as cheerio from 'cheerio';

class Scraper {
    async scrape(urls: string[]): Promise<string[]> {
        const results = await this.scrapeAsync(urls);
        return results;
    }

    private async scrapeAsync(urls: string[]): Promise<string[]> {
        const tasks = urls.map(url => this.fetchAndParse(url));
        return Promise.all(tasks);
    }

    private async fetchAndParse(url: string): Promise<string> {
        let html = "";
        try {
            html = await this.fetch(url);
        } catch (error) {
            // TODO: Log this error
        }
        return this.parseHtml(html);
    }

    private async fetch(url: string): Promise<string> {
        const response = await axios.get(url);
        return response.data;
    }

    private parseHtml(html: string): string {
        const $ = cheerio.load(html);
        return $.text();
    }
}

export default Scraper;
