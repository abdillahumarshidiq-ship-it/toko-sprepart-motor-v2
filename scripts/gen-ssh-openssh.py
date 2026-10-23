#!/usr/bin/env python3
"""Convert ed25519 PEM key to OpenSSH format using cryptography library."""
import base64
import struct
import sys

try:
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
    from cryptography.hazmat.primitives import serialization
except ImportError:
    print("Installing cryptography...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cryptography", "-q"])
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
    from cryptography.hazmat.primitives import serialization

# Baca private key PEM
with open("/home/z/.ssh/id_ed25519_private", "rb") as f:
    pem_data = f.read()

private_key = serialization.load_pem_private_key(pem_data, password=None)
public_key = private_key.public_key()

# Serialize private key to OpenSSH format
private_openssh = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.OpenSSH,
    encryption_algorithm=serialization.NoEncryption(),
)

# Serialize public key to OpenSSH format
public_openssh = public_key.public_bytes(
    encoding=serialization.Encoding.OpenSSH,
    format=serialization.PublicFormat.OpenSSH,
)

with open("/home/z/.ssh/id_ed25519", "wb") as f:
    f.write(private_openssh)

# public_openssh is bytes, decode to str
public_str = public_openssh.decode("utf-8") if isinstance(public_openssh, bytes) else public_openssh
with open("/home/z/.ssh/id_ed25519.pub", "w") as f:
    f.write(public_str + "\n")

import os
os.chmod("/home/z/.ssh/id_ed25519", 0o600)
os.chmod("/home/z/.ssh/id_ed25519.pub", 0o644)

print("✓ Private key (OpenSSH format): /home/z/.ssh/id_ed25519")
print("✓ Public key (OpenSSH format): /home/z/.ssh/id_ed25519.pub")
print()
print("=== Public key to add to GitHub ===")
print(public_str + " sijambul-deploy")
