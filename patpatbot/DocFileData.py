class DocFileData:
    path: str
    tool: str
    pattern_filename: str
    pattern_description: str
    pattern_description_improved: str

    def __init__(self, tool, path, pattern_filename, pattern_description):
        self.tool = tool
        self.path = path
        self.pattern_filename = pattern_filename
        self.pattern_description = pattern_description

    def to_dict(self, key_prefix=""):
        output = {}
        for attr in dir(self):
            if not callable(attr) and not attr.startswith("__"):
                output[key_prefix + attr] = getattr(self, attr)
        return output


