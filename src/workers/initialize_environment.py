import sys

class _LogRedirect:
    """
    Redirects Python's stdout so plain print() calls inside user
    strategy code get streamed to the terminal panel via _emit_log,
    the same way explicit _emit_log() calls do.

    _emit_log is injected into the global scope by the worker before
    this module runs — see backtest.worker.ts.
    """

    def write(self, text):
        text = text.strip()
        if text:
            _emit_log(text, "info")

    def flush(self):
        pass


sys.stdout = _LogRedirect()