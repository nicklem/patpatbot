import os
from dotenv import load_dotenv
from patpatbot.Gpt import Gpt
import unittest

load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')


class TestGpt(unittest.TestCase):

    def setUp(self):
        self.__gpt = Gpt(OPENAI_API_KEY)

    def test_gpt_accepts_hardcoded_input(self):
        name = "TestBot"
        output = self.__gpt.execute(
            prompt_system="Your name is {name}.".format(name=name),
            prompt_human="What is your name? Print **only** your name.",
        )
        self.assertEqual(name, output)

    def test_gpt_accepts_formatted_input(self):
        name = "TestBot"
        output = self.__gpt.execute(
            prompt_system="Your name is {name}.",
            prompt_human="What is your name? Print **only** your name.",
            prompt_data={"name": name},
        )
        self.assertEqual(name, output)
