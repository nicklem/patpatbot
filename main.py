import os
from dotenv import load_dotenv
from patpatbot.bot import PatPatBot
from patpatbot.google import GoogleSearch
from patpatbot.gpt import Gpt

load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

if __name__ == "__main__":
    bot = PatPatBot(
        gpt=Gpt(OPENAI_API_KEY),
        search=GoogleSearch()
    )

    print(bot.investigate_pattern(
        tool="CakePHP",
        language="PHP",
        pattern_description="Classes: Return Type Hint",
        pattern_title="CakePHP_Classes_ReturnTypeHint"
    ))
