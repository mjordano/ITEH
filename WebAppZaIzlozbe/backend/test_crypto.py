from passlib.hash import bcrypt
import sys

print("Testing bcrypt hash...")
try:
    h = bcrypt.hash("test")
    print(f"Hash result: {h}")
except Exception as e:
    print(f"Error hashing: {e}")
