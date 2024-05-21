from . import PATH_GIT_CACHE, REPO_LIST
from .Repository import Repository


class RepoManager:
    def __init__(self):
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
    def _init_repos():
        return [
            Repository.from_settings(repo_settings, PATH_GIT_CACHE)
            for repo_settings in REPO_LIST
        ]
