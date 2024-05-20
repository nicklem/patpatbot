import os
from patpatbot.google import GoogleSearch
from patpatbot.gpt import Gpt


class PatPatBot:
    def __init__(self, gpt: Gpt, search: GoogleSearch):
        self.__gpt = gpt
        self.__search = search

    def investigate_pattern(self, tool, language, pattern_description, pattern_title):
        """
        Investigate a pattern from a tool, doing a search for the pattern, using the available data.

        :param tool: Name of the tool that the pattern is from.
        :param language: Programming language that the tool is for and the pattern is in.
        :param pattern_description: Description of the pattern.
        :param pattern_title:
        :return: The pattern's investigation results as a string.
        """

        return self.__gpt.execute_prompt(
            [
                (
                    "system",
                    "You're a senior technical writer at a software company, specializing in static analysis tools."
                ),
                ("human", self._load_prompt("investigate_pattern"))
            ],
            {
                "language": language,
                "pattern_description": pattern_description,
                "pattern_info": self.__search.gather_info(f"{tool} {language} {pattern_description}"),
                "pattern_title": pattern_title,
                "tool": tool,
            }
        )

    @staticmethod
    def _load_prompt(prompt_name):
        dir_path = os.path.dirname(os.path.realpath(__file__))
        file_path = os.path.join(dir_path, "..", "prompts", prompt_name)
        with open(file_path, "r") as prompt_file:
            return prompt_file.read()