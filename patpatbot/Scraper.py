import aiohttp
import asyncio
from bs4 import BeautifulSoup


class Scraper:
    def scrape(self, urls):
        """
        Scrape the HTML content from a list of URLs.

        :param urls:
        :return:
        """
        loop = asyncio.get_event_loop()
        results = loop.run_until_complete(self._scrape_async(urls))
        return results

    async def _scrape_async(self, urls):
        async with aiohttp.ClientSession() as session:
            tasks = []
            for url in urls:
                task = asyncio.create_task(self._fetch_and_parse(session, url))
                tasks.append(task)
            return await asyncio.gather(*tasks)

    async def _fetch_and_parse(self, session, url):
        html = ""
        try:
            html = await self._fetch(session, url)
        except Exception as _:
            print(f"Failed to fetch {url}")
        finally:
            return self._parse_html(html)

    @staticmethod
    async def _fetch(session, url):
        async with session.get(url) as response:
            return await response.text()

    @staticmethod
    def _parse_html(html):
        soup = BeautifulSoup(html, 'html.parser')
        return soup.get_text()
