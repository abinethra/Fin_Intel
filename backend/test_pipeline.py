"""Standalone CLI Test Pipeline for the Multi-Agent Financial Intelligence System (Backend Folder)."""
import asyncio
import sys
import os

# Ensure parent directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from test_pipeline import main

if __name__ == "__main__":
    asyncio.run(main())
