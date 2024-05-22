from patpatbot.GoogleSearch import GoogleSearch
import unittest


class TestBot(unittest.TestCase):
    def setUp(self):
        self.__search = GoogleSearch()

    def test_simple_query_gets_response(self):
        results = self.__search.execute('python decorator pattern')
        self.assertGreater(len(results), 0)
