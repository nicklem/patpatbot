from os.path import basename, exists, join
from .DocFileData import DocFileData
from git import Repo
from glob import glob
import re


class Repository:
    def __init__(self, name, repo_url, repo_dir, docs_glob, replace_name="codacy-"):
        self.__name = name.replace(replace_name, "") if replace_name else name
        self.__dir = repo_dir
        self.__url = repo_url
        self.__doc_file_data = self._load_doc_file_data(docs_glob)
        self._clone_or_pull()

    def get_doc_file_data(self) -> list[DocFileData]:
        return self.__doc_file_data

    @staticmethod
    def from_settings(repo_settings, cache_path):
        repo_url = repo_settings["url"]
        repo_dir = Repository._repo_dir_from_url(repo_url, cache_path)

        return Repository(
            name=(Repository._repo_name_from_url(repo_url)),
            repo_url=repo_url,
            repo_dir=repo_dir,
            docs_glob=join(repo_dir, repo_settings["docs_glob"])
        )

    def _load_doc_file_data(self, docs_glob):
        return [
            DocFileData(
                tool=self.__name,
                path=doc,
                pattern_filename=basename(doc),
                pattern_description=open(doc, "r").read()
            )
            for doc in glob(docs_glob)
        ]

    @staticmethod
    def _repo_name_from_url(url):
        return re.match(r".*/(.*)\.git", url).group(1)

    @staticmethod
    def _repo_dir_from_url(url: str, cache_path: str) -> str:
        return join(cache_path, Repository._repo_name_from_url(url))

    def _clone_or_pull(self):
        if not exists(self.__dir):
            Repo.clone_from(self.__url, self.__dir)
        # TODO more efficient to clone/pull on demand
        # else:
        #     Repo(self.__dir).remotes.origin.pull()
