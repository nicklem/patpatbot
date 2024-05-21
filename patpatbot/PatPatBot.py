from . import GLOB_PROMPT_FILES
from .PromptTemplate import PromptTemplate
from .DocFileData import DocFileData
from .GoogleSearch import GoogleSearch
from .Gpt import Gpt


class PatPatBot:
    def __init__(self, gpt: Gpt, search: GoogleSearch):
        self.__gpt = gpt
        self.__search = search
        self.__prompt_templates = self._load_prompt_templates()
        self.__prompt_data = {}

    def set_source_doc_data(self, doc_file_data: DocFileData):
        self.__prompt_data = doc_file_data.to_dict()

    def process_source_doc(self):
        for prompt_template in self.__prompt_templates:
            if prompt_template.is_search():
                self._do_search(prompt_template)
            elif prompt_template.is_gpt:
                self._do_prompt(prompt_template)

    def get_prompt_data(self, prompt_id: str):
        return self.__prompt_data[prompt_id]

    def _set_prompt_data(self, prompt_id: str, result: str):
        self.__prompt_data[prompt_id] = result

    def _do_search(self, prompt_template: PromptTemplate):
        self._set_prompt_data(
            prompt_template.id,
            self.__search.execute(prompt_template.prompt_human.format(**self.__prompt_data))
        )

    def _do_prompt(self, prompt_template: PromptTemplate):
        self._set_prompt_data(
            prompt_template.id,
            self.__gpt.execute(
                prompt_system=prompt_template.prompt_system,
                prompt_human=prompt_template.prompt_human,
                prompt_data=self.__prompt_data,
            )
        )

    @staticmethod
    def _load_prompt_templates() -> list[PromptTemplate]:
        return [PromptTemplate.from_file_path(file_path) for file_path in GLOB_PROMPT_FILES]
