from patpatbot.git import RepoManager
import unittest

# TODO: Add tests for the RepoManager class


class TestGpt(unittest.TestCase):
    def setUp(self):
        self.__repo_manager = RepoManager()
