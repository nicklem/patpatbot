from dotenv import load_dotenv
import json
from glob import glob
import os
from os.path import join, dirname, realpath, exists

load_dotenv()

ENV_OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ENV_DOCS_GLOB = os.getenv('INPUT_DOCS_GLOB')
ENV_REPO_NAME = os.getenv('REPO_NAME')

DOC_FILES = glob(ENV_DOCS_GLOB)

GLOB_PROMPT_FILES = sorted(glob(join(dirname(realpath(__file__)), "..", "settings", "prompts", "*.json")))

PATH_GIT_CACHE = join(dirname(realpath(__file__)), "..", ".cache", "git")
if not exists(PATH_GIT_CACHE):
    os.makedirs(PATH_GIT_CACHE)

PATH_REPO_LIST = join(dirname(realpath(__file__)), "..", "settings", "repositories.json")
with open(PATH_REPO_LIST, "r") as repo_list_file:
    REPO_LIST = json.load(repo_list_file)

