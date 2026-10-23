#!/usr/bin/env python3
"""Convert uploaded logo to optimized PNG logo for the website."""
import shutil
from pathlib import Path

src = Path("/home/z/my-project/upload/ChatGPT Image Oct 2, 2026, 02_51_29 PM.png.crdownload")
dst_dir = Path("/home/z/my-project/public")
dst = dst_dir / "logo-sijambul.png"
dst_square = dst_dir / "logo-sijambul-square.png"

# Copy the original PNG to public folder
shutil.copy(src, dst)
print(f"Copied logo to: {dst} ({dst.stat().st_size} bytes)")

# Also make a square version (the original is already 1254x1254 square)
shutil.copy(src, dst_square)
print(f"Copied square logo to: {dst_square} ({dst_square.stat().st_size} bytes)")

# Try to optimize with PIL if available
try:
    from PIL import Image
    img = Image.open(src)
    print(f"Original size: {img.size}, mode: {img.mode}")
    
    # Resize to a reasonable logo size (256x256 for square, keep aspect)
    img_square = img.convert("RGBA")
    img_square.thumbnail((256, 256), Image.LANCZOS)
    img_square.save(dst_square, "PNG", optimize=True)
    print(f"Optimized square logo: {dst_square} ({dst_square.stat().st_size} bytes)")
    
    # Also save full size for hero/header display
    img_full = img.convert("RGBA")
    img_full.save(dst, "PNG", optimize=True)
    print(f"Full logo: {dst} ({dst.stat().st_size} bytes)")
except ImportError:
    print("PIL not available, using original file as-is")
