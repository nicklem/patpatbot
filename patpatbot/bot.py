from patpatbot.google import GoogleSearch
from patpatbot.gpt import Gpt


class PatPatBot:
    def __init__(self, gpt: Gpt, search: GoogleSearch):
        self.__gpt = gpt
        self.__search = search

    def investigate_pattern(self, tool, language, pattern_description):
        """
        Investigate a pattern from a tool, doing a search for the pattern, using the available data.

        :param tool: Name of the tool that the pattern is from.
        :param language: Programming language that the tool is for and the pattern is in.
        :param pattern_description: Description of the pattern.
        :return: The pattern's investigation results as a string.
        """
        pattern_info = self.__search.gather_info(f"{tool} {language} {pattern_description}")
        # TODO extract the prompt to a config file or some such
        prompt = """Investigate the pattern '{pattern_description}' from tool {tool} in language {language}.
                 A Google search yielded the following data which may be relevant: ```{pattern_info}```
                 Provide a short description of the pattern, approximately under 20 words.
                 This will be used as-is in pattern documentation.
                 Be mindful of that and adopt a professional, terse tone.
                 Don't mention the name of the pattern in the description.
                 Limit yourself to providing a concise summary of the pattern's meaning and suggested action."""

        return self.__gpt.prompt(
            [
                (
                    "system",
                    "You're a senior technical writer at a software company, specializing in static analysis tools."
                ),
                ("human", prompt)
            ],
            {
                "language": language,
                "pattern_description": pattern_description,
                "pattern_info": pattern_info,
                "tool": tool,
            }
        )
