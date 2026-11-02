"""Generate the scrypt password hash used by PAZOSTACK's Vercel login."""
import getpass
import hashlib
import os

password = getpass.getpass("Create the PAZOSTACK login password (12+ characters): ")
if len(password) < 12:
    raise SystemExit("Use at least 12 characters, then run this script again.")

salt = os.urandom(16)
digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1, dklen=64)
print("\nCopy this complete value into PAZOSTACK_LOGIN_PASSWORD_HASH in Vercel:\n")
print(f"scrypt${salt.hex()}${digest.hex()}")
