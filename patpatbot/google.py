import json
from googleapiclient.discovery import build
from .scraper import Scraper


class GoogleSearch:
    def __init__(self, api_key, cse_id):
        """
        :param api_key: API key for Google Custom Search.
        :param cse_id: Custom Search Engine ID.
        """
        self.__api_key = api_key
        self.__cse_id = cse_id
        self.__scraper = Scraper()

    def gather_info(self, query, num_results=10) -> str:
        """
        Perform a Google search and scrape the results.

        :param query: Search query.
        :param num_results: Number of search results to return.
        :return: List of scraped results.
        """
        result_urls = self._search(query, num_results)
        result_data = self.__scraper.scrape(result_urls)
        return json.dumps(result_data)

    def _search(self, query, num_results=10):
        """
        Perform a Google search using the Custom Search JSON API.
        """
        with build("customsearch", "v1", developerKey=self.__api_key) as service:
            response = service.cse().list(q=query, cx=self.__cse_id, num=num_results).execute()
            return [r['link'] for r in response['items']]
