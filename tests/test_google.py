from patpatbot.google import GoogleSearch
import unittest


class TestBot(unittest.TestCase):
    def setUp(self):
        self.__search = GoogleSearch()

    def test_simple_query_gets_response(self):
        results = self.__search.gather_info('python decorator pattern')
        self.assertGreater(len(results), 0)  # TODO improve this test
