import json
from glob import glob
from os import makedirs
from os.path import join, dirname, realpath, exists

GLOB_PROMPT_FILES = sorted(glob(join(dirname(realpath(__file__)), "..", "settings", "prompts", "*.json")))
PATH_GIT_CACHE = join(dirname(realpath(__file__)), "..", ".cache", "git")
if not exists(PATH_GIT_CACHE):
    makedirs(PATH_GIT_CACHE)

PATH_REPO_LIST = join(dirname(realpath(__file__)), "..", "settings", "repositories.json")
with open(PATH_REPO_LIST, "r") as repo_list_file:
    REPO_LIST = json.load(repo_list_file)
