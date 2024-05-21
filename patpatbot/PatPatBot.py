from .PromptTemplate import PromptTemplate
from .RepoManager import DocFileData
from .GoogleSearch import GoogleSearch
from .Gpt import Gpt
from glob import glob
from os.path import join, dirname, realpath


class PatPatBot:
    def __init__(self, gpt: Gpt, search: GoogleSearch):
        self.__gpt = gpt
        self.__search = search
        self.__prompt_templates = self._load_prompt_templates()
        self.__prompt_data = {}

    def set_source_doc_data(self, doc_file_data: DocFileData):
        self.__prompt_data = doc_file_data.to_dict(prefix="init__")

    def process_source_doc(self):
        for prompt_template in self.__prompt_templates:
            if prompt_template.is_search():
                self._do_search(prompt_template)
            elif prompt_template.is_gpt:
                self._do_prompt(prompt_template)

    def extract_prompt_result(self, key: str):
        return self.__prompt_data[key]

    def _do_search(self, prompt_template: PromptTemplate):
        self._update_prompt_data(
            prompt_template.name,
            self.__search.execute(prompt_template.prompt_human.format(**self.__prompt_data))
        )

    def _do_prompt(self, prompt_template: PromptTemplate):
        self._update_prompt_data(
            prompt_template.name,
            self.__gpt.execute(
                prompt_system=prompt_template.prompt_system,
                prompt_human=prompt_template.prompt_human,
                prompt_data=self.__prompt_data,
            )
        )

    def _update_prompt_data(self, key: str, value: str):
        self.__prompt_data[key] = value

    @staticmethod
    def _load_prompt_templates() -> list[PromptTemplate]:
        prompt_file_paths = glob(join(dirname(realpath(__file__)), "..", "settings", "prompts", "*.json"))
        prompt_file_paths.sort()  # Expects template names to begin with numbers (e.g., 01_prompt.yaml)
        return [PromptTemplate.from_file_path(file_path) for file_path in prompt_file_paths]
