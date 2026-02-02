import os
import shutil
import uuid
from datetime import datetime
from fastapi import UploadFile
from typing import List

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "images")
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(file: UploadFile) -> str:

    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return f"/static/images/{unique_filename}"

async def save_upload_files(files: List[UploadFile]) -> List[str]:

    saved_paths = []
    for file in files:
        if file.filename: 
            path = await save_upload_file(file)
            saved_paths.append(path)
    return saved_paths
