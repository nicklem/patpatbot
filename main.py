from dotenv import load_dotenv
from patpatbot.GoogleSearch import GoogleSearch
from patpatbot.Gpt import Gpt
from patpatbot.PatPatBot import PatPatBot
from patpatbot.RepoManager import RepoManager
import os

load_dotenv()

if __name__ == "__main__":
    repo_manager = RepoManager()

    bot = PatPatBot(
        gpt=Gpt(os.getenv('OPENAI_API_KEY')),
        search=GoogleSearch()
    )

    for repo in repo_manager.repos:
        for doc_file_data in repo.get_doc_file_data()[:1]:  # TODO remove [:1]
            bot.set_source_doc_data(doc_file_data)
            bot.process_source_doc()
            print(bot.get_prompt_result('examine'))
