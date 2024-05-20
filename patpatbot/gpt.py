from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate


class Gpt:
    def __init__(self, openai_api_key, model="gpt-4o"):
        self.__model = ChatOpenAI(model=model, api_key=openai_api_key)
        self.__output_parser = StrOutputParser()

    def prompt(self, prompt_template_messages, prompt_data=None):
        """
        :param prompt_template_messages: List of tuples containing the message type and the message content.
            Example: [("system", "Your name is {name}."), ("human", "{user_input}")]
        :param prompt_data: Dictionary containing the data to be used in the prompt.
            Example: {"name": "TestBot", "user_input": "What is your name? Print **only** your name."}
        """
        if prompt_data is None:
            prompt_data = {}

        return self._do_prompt_from_messages(prompt_template_messages, prompt_data)

    def _do_prompt_from_messages(self, prompt_template_messages, prompt_data):
        prompt = ChatPromptTemplate.from_messages(prompt_template_messages)
        chain = prompt | self.__model | self.__output_parser
        return chain.invoke(prompt_data)
