import os
import pprint

from dotenv import load_dotenv
from patpatbot.google import GoogleSearch
import unittest


load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')


class TestBot(unittest.TestCase):

    def setUp(self):
        self.__search = GoogleSearch(GOOGLE_API_KEY, GOOGLE_CSE_ID)

    def test_simple_query_gets_response(self):
        results = self.__search.gather_info('python', 3)
        pprint.pp(results)
        self.assertTrue(len(results) == 3)
