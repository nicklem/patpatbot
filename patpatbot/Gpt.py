from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI


class Gpt:
    def __init__(self, openai_api_key, model="gpt-4o"):
        self.__model = ChatOpenAI(model=model, api_key=openai_api_key)

    def execute(self, prompt_human: str, prompt_data=None, prompt_system=None) -> str:
        """
        Formats the prompt and executes it.

        :param prompt_human: The main prompt template.
        :param prompt_data: Dict containing the data to be formatted into the prompt.
        :param prompt_system: The system prompt template.
        :return: The output from the model.
        """
        prompt_template_messages = []

        if prompt_system:
            prompt_template_messages.append(("system", prompt_system))

        prompt_template_messages.append(("human", prompt_human))

        return self._do_prompt_from_messages(prompt_template_messages, prompt_data)

    def _do_prompt_from_messages(self, prompt_template_messages, prompt_data=None):
        if not prompt_data:
            prompt_data = {}

        prompt = ChatPromptTemplate.from_messages(prompt_template_messages)
        output_parser = StrOutputParser()

        chain = prompt | self.__model | output_parser

        return chain.invoke(prompt_data)
