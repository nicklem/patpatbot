import os
from dotenv import load_dotenv
from patpatbot.bot import PatPatBot
from patpatbot.google import GoogleSearch
from patpatbot.gpt import Gpt

load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')

if __name__ == "__main__":
    bot = PatPatBot(
        gpt=Gpt(OPENAI_API_KEY),
        search=GoogleSearch(GOOGLE_API_KEY, GOOGLE_CSE_ID)
    )

    print(bot.investigate_pattern(
        tool="PEP",
        language="Python",
        pattern_description="PEP 8: E303 too many blank lines (3)"
    ))
