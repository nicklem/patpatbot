from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate


class PatPatBot:
    def __init__(self, api_key):
        self.API_KEY = api_key

    def _do_prompt(self, prompt_messages_template, prompt_data):
        prompt = ChatPromptTemplate.from_messages(prompt_messages_template)
        model = ChatOpenAI(model="gpt-4", api_key=self.API_KEY)
        output_parser = StrOutputParser()
        chain = prompt | model | output_parser
        return chain.invoke(prompt_data)

    def prompt_sample(self):
        prompt_messages_template = [
            ("system", "You are a helpful AI bot. Your name is {name}."),
            ("human", "Hello, how are you doing?"),
            ("ai", "I'm doing well, thanks!"),
            ("human", "{user_input}"),
        ]
        prompt_data = {
            "name": "Bob",
            "user_input": "What is your name?"
        }
        return self._do_prompt(prompt_messages_template, prompt_data)

