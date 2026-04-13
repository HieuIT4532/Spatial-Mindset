# Bridge for Vercel Serverless Functions
import sys
import os

# Add the root directory to sys.path so we can import packages from it
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from SpatialMind_Backend.main import app
