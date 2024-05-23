import axios from 'axios';
import * as cheerio from 'cheerio';
import logger from "./logging";

class Scraper {
    async scrape(urls: string[]): Promise<string[]> {
        const tasks = urls.map(url => this.fetchAndParse(url));
        return Promise.all(tasks);
    }

    private async fetchAndParse(url: string): Promise<string> {
        let html: string;
        try {
            html = await this.fetch(url);
        } catch (error) {
            html = ""; // Ignore any HTTP errors on specific page loads.
        }
        return this.parseHtml(html);
    }

    private async fetch(url: string): Promise<string> {
        const response = await axios.get(url);
        return response.data;
    }

    private parseHtml(html: string): string {
        const $ = cheerio.load(html);
        const output = $('p').text();
        logger.info(`Scraped ${output.slice(0, 100)}...`);
        // TODO some results are way too long. Truncating now; investigate alternatives.
        return output.slice(0, 25000);
    }
}

export default Scraper;
