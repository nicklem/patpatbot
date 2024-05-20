import os
from dotenv import load_dotenv
from patpatbot.bot import PatPatBot
import unittest

from patpatbot.google import GoogleSearch
from patpatbot.gpt import Gpt

load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')


class TestPatPatBot(unittest.TestCase):

    def setUp(self):
        self.__bot = PatPatBot(
            gpt=Gpt(OPENAI_API_KEY),
            search=GoogleSearch()
        )

    def test_bot_does_some_investigation(self):
        investigation_result = self.__bot.investigate_pattern(
            tool="PEP",
            pattern_description="PEP 8: E303 too many blank lines (3)",
            pattern_title="PEP8_E303",
        )
        self.assertGreater(len(investigation_result), 0)  # TODO improve this test
