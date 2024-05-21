import json
import re


class PromptTemplate:
    id: str
    prompt_system: str
    prompt_human: str
    tool: str

    def __init__(self, prompt_id, prompt_system, prompt_human, tool):
        self.id = prompt_id
        self.prompt_system = prompt_system
        self.prompt_human = prompt_human
        self.tool = tool

    def is_search(self):
        return self.tool == "google"

    @property
    def is_gpt(self):
        return self.tool == 'gpt'

    @staticmethod
    def from_file_path(file_path):
        with open(file_path, "r") as prompt_file:
            prompt_file_data = json.load(prompt_file)

        return PromptTemplate(
            prompt_id=re.search(r"\d{2}-(.+)\.json$", file_path).group(1),
            prompt_system=prompt_file_data.get("prompt_system", ""),
            prompt_human=prompt_file_data.get("prompt_human", ""),
            tool=(prompt_file_data.get("tool", ""))
        )
