import os
from dotenv import load_dotenv
from patpatbot.bot import PatPatBot
import unittest

load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')


class TestBot(unittest.TestCase):

    def setUp(self):
        self.__bot = PatPatBot(OPENAI_API_KEY)

    def test_patpatbot_accepts_hardcoded_input(self):
        name = "TestBot"
        output = self.__bot.prompt([
            ("system", "Your name is {name}.".format(name=name)),
            ("human", "What is your name? Print **only** your name."),
        ])
        self.assertEqual(name, output)

    def test_patpatbot_accepts_formatted_input(self):
        name = "TestBot"
        output = self.__bot.prompt(
            [
                ("system", "Your name is {name}."),
                ("human", "{user_input}"),
            ],
            {
                "name": name,
                "user_input": "What is your name? Print **only** your name."
            }
        )
        self.assertEqual(name, output)
