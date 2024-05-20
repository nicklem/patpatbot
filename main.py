import os
from dotenv import load_dotenv
from patpatbot.bot import PatPatBot

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

if __name__ == "__main__":
    bot = PatPatBot(api_key=OPENAI_API_KEY)
    print(bot.prompt_sample())
