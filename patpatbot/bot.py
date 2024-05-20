from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate


class PatPatBot:
    def __init__(self, api_key, model="gpt-4"):
        self.model = ChatOpenAI(model=model, api_key=api_key)
        self.output_parser = StrOutputParser()

    def _do_prompt_from_messages(self, prompt_template_messages, prompt_data):
        prompt = ChatPromptTemplate.from_messages(prompt_template_messages)
        chain = prompt | self.model | self.output_parser
        return chain.invoke(prompt_data)

    def prompt(self, prompt_template_messages, prompt_data=None):
        if prompt_data is None:
            prompt_data = {}

        return self._do_prompt_from_messages(prompt_template_messages, prompt_data)
