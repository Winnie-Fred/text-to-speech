class TaskAbortedException(Exception):
    def __init__(self, message="Task was aborted"):
        self.message = message
        super().__init__(self.message)