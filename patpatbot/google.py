from bs4 import BeautifulSoup
import json
import requests
from .scraper import Scraper


class GoogleSearch:
    def __init__(self):
        self.__scraper = Scraper()

    def gather_info(self, query) -> str:
        """
        Perform a Google search and scrape the results.

        :param query: Search query.
        :return: List of scraped results.
        """
        result_urls = self._search(query)
        result_data = self.__scraper.scrape(result_urls)
        return json.dumps(result_data)

    @staticmethod
    def _search(query):
        """
        Scrape the Google SERP.

        Note: Avoiding the Custom Search API here because it has very limited free usage.
        """
        response = requests.get(
            "https://www.google.com/search",
            params={"q": query},
            # Headers are necessary to avoid Google complaining
            headers={"User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"}
        )
        soup = BeautifulSoup(response.text, 'html.parser')
        links = soup.select('#search span>a')  # TODO eventually make this more robust
        return [link['href'] for link in links]
