from dotenv import load_dotenv
from patpatbot.GoogleSearch import GoogleSearch
from patpatbot.Gpt import Gpt
from patpatbot.PatPatBot import PatPatBot
from patpatbot.DocFileData import DocFileData
import os
import unittest

load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')


class TestPatPatBot(unittest.TestCase):

    def setUp(self):
        self.__bot = PatPatBot(
            gpt=Gpt(OPENAI_API_KEY),
            search=GoogleSearch()
        )

    def test_bot_does_some_investigation(self):
        sample_doc_data = DocFileData(
            tool="PEP",
            pattern_description="PEP 8: E303 too many blank lines (3)",
            pattern_filename="PEP8_E303",
            path="path/to/doc-file.md",
        )

        self.__bot.set_source_doc_data(sample_doc_data)
        self.__bot.process_source_doc()
        result = self.__bot.get_prompt_data('examine')

        self.assertGreater(len(result), 0)  # TODO improve this test
