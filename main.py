from patpatbot import ENV_OPENAI_API_KEY, ENV_REPO_NAME, ENV_DOCS_GLOB
from patpatbot.GoogleSearch import GoogleSearch
from patpatbot.Gpt import Gpt
from patpatbot.PatPatBot import PatPatBot
from patpatbot.Repository import Repository

if __name__ == "__main__":
    bot = PatPatBot(gpt=Gpt(ENV_OPENAI_API_KEY), search=GoogleSearch())
    repo = Repository(ENV_REPO_NAME, ENV_DOCS_GLOB)

    for doc_file_data in repo.docs[:1]:  # TODO remove [:1]
        # print(doc_file_data.pattern_filename)
        bot.set_source_doc_data(doc_file_data)
        bot.process_source_doc()
        print(bot.get_prompt_data('examine'))
