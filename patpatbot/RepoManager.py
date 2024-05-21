from os.path import dirname, realpath, join, exists
from os import makedirs
from .Repository import Repository
import json


class RepoManager:
    PATH_GIT_CACHE = join(dirname(realpath(__file__)), "..", ".cache", "git")
    PATH_SETTINGS = join(dirname(realpath(__file__)), "..", "settings", "repositories.json")

    def __init__(self):
        RepoManager._init_git_cache()
        self.__repo_settings = RepoManager._load_settings()
        self.__repos = self._init_repos()

    def list_repo_docs(self):
        repo_docs = []
        for repo in self.__repos:
            repo_docs += repo.list_docs()
        return repo_docs

    @property
    def repos(self):
        return self.__repos

    @staticmethod
    def _load_settings():
        with open(RepoManager.PATH_SETTINGS, "r") as settings_file:
            return json.load(settings_file)

    @staticmethod
    def _init_git_cache():
        if not exists(RepoManager.PATH_GIT_CACHE):
            makedirs(RepoManager.PATH_GIT_CACHE)

    def _init_repos(self):
        return [
            Repository.from_settings(repo_settings, RepoManager.PATH_GIT_CACHE)
            for repo_settings in self.__repo_settings
        ]

