import os
import yaml
from patpatbot.google import GoogleSearch
from patpatbot.gpt import Gpt


class PatPatBot:
    def __init__(self, gpt: Gpt, search: GoogleSearch):
        self.__gpt = gpt
        self.__search = search

    def investigate_pattern(self, tool, pattern_description, pattern_title):
        """
        Investigate a pattern from a tool, doing a search for the pattern, using the available data.

        :param tool: Name of the tool that the pattern is from.
        :param language: Programming language that the tool is for and the pattern is in.
        :param pattern_description: Description of the pattern.
        :param pattern_title:
        :return: The pattern's investigation results as a string.
        """

        return self.__gpt.execute_prompt(
            self._load_prompt_template_from_yaml("investigate_pattern"),
            {
                "pattern_description": pattern_description,
                "pattern_info": self.__search.gather_info(f"{tool} {pattern_description}"),
                "pattern_title": pattern_title,
                "tool": tool,
            }
        )

    @staticmethod
    def _load_prompt_template_from_yaml(prompt_name):
        dir_path = os.path.dirname(os.path.realpath(__file__))
        file_path = os.path.join(dir_path, "..", "settings", "prompts", f"{prompt_name}.yaml")

        with open(file_path, "r") as prompt_file:
            # Convert list of lists to list of tuples to comply with the expected input format
            return [tuple(entry) for entry in yaml.safe_load(prompt_file)]
