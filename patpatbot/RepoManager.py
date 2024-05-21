from git import Repo
from glob import glob
import os
import re
import yaml


class DocFileData:
    path: str
    tool: str
    pattern_filename: str
    pattern_description: str
    pattern_description_improved: str

    def __init__(self, tool, path, pattern_filename, pattern_description):
        self.tool = tool
        self.path = path
        self.pattern_filename = pattern_filename
        self.pattern_description = pattern_description

    def to_dict(self, prefix=""):
        output = {}
        for attr in dir(self):
            if not callable(attr) and not attr.startswith("__"):
                output[prefix + attr] = getattr(self, attr)
        return output

    @property
    def attribute_names(self):
        return [attr for attr in dir(self) if not callable(attr) and not attr.startswith("__")]


class RepoItem:
    def __init__(self, name, repo_url, repo_dir, docs_glob):
        self.__name = name.replace("codacy-", "")  # TODO hacky
        self.__dir = repo_dir
        self.__url = repo_url
        self.__doc_file_data = [
            DocFileData(
                tool=self.__name,
                path=doc,
                pattern_filename=os.path.basename(doc),
                pattern_description=open(doc, "r").read()
            )
            for doc in glob(docs_glob)
        ]

        # self._clone_or_pull()

    def get_doc_file_data(self) -> list[DocFileData]:
        return self.__doc_file_data

    def _clone_or_pull(self):
        if not os.path.exists(self.__dir):
            Repo.clone_from(self.__url, self.__dir)
        else:
            Repo(self.__dir).remotes.origin.pull()


class RepoManager:
    def __init__(self):
        dir_path = os.path.dirname(os.path.realpath(__file__))

        self.__git_cache_path = os.path.join(dir_path, "..", ".cache", "git")
        if not os.path.exists(self.__git_cache_path):
            os.makedirs(self.__git_cache_path)

        settings_path = os.path.join(dir_path, "..", "settings", "repositories.yaml")
        with open(settings_path, "r") as settings_file:
            self.__repo_settings = yaml.safe_load(settings_file)

        self.__repos = []
        self._init_repos()

    def _init_repos(self):
        for repo in self.__repo_settings:
            self.__repos.append(
                RepoItem(
                    self._repo_name_from_url(repo["url"]),
                    repo["url"],
                    self._repo_dir_from_url(repo["url"]),
                    os.path.join(self._repo_dir_from_url(repo["url"]), repo["docs_glob"])
                )
            )

    def list_repo_docs(self):
        repo_docs = []
        for repo in self.__repos:
            repo_docs += repo.list_docs()
        return repo_docs

    @property
    def repos(self):
        return self.__repos

    @staticmethod
    def _repo_name_from_url(url):
        return re.match(r".*/(.*)\.git", url).group(1)

    def _repo_dir_from_url(self, url):
        return os.path.join(
            self.__git_cache_path,
            self._repo_name_from_url(url)
        )
