from os.path import basename, join
from .DocFileData import DocFileData
from glob import glob
import re


class Repository:
    def __init__(self, name, docs_glob, replace_name="codacy-"):
        self.__name = name.replace(replace_name, "") if replace_name else name
        self.__doc_file_data = self._load_doc_file_data(docs_glob)

    @property
    def docs(self) -> list[DocFileData]:
        return self.__doc_file_data

    @staticmethod
    def from_settings(name, docs_glob):
        return Repository(
            name=name,
            docs_glob=docs_glob,
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

