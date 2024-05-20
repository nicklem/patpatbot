import os
from dotenv import load_dotenv
from patpatbot.bot import PatPatBot
from patpatbot.git import RepoManager
from patpatbot.google import GoogleSearch
from patpatbot.gpt import Gpt
import pprint

load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

if __name__ == "__main__":
    bot = PatPatBot(
        gpt=Gpt(OPENAI_API_KEY),
        search=GoogleSearch()
    )

    repo_manager = RepoManager()

    for repo in repo_manager.repos:
        for doc in repo.get_docs()[:1]:  # TODO remove [:1]
            doc["new_pattern_description"] = bot.investigate_pattern(
                tool=doc["tool"],
                pattern_description=doc["pattern_description"],
                pattern_title=doc["pattern_filename"],
            )
            pprint.pp(doc)
