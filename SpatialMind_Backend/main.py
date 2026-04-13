import os
import json
import logging
import sympy as sp
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types
import time

# Load biến môi trường
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Khởi tạo Gemini client theo SDK mới nhất google-genai
gemini_client = None
if GEMINI_API_KEY and GEMINI_API_KEY != "your_api_key_here":
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logging.warning(f"Không thể khởi tạo Gemini client: {e}")

app = FastAPI(
    title="SpatialMind API with Gemini AI",
    description="API cho ứng dụng SpatialMind, kết hợp Gemini và SymPy",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GeometryRequest(BaseModel):
    query: str = Field(..., description="Đề bài ngôn ngữ tự nhiên từ học sinh")

class DrawElement(BaseModel):
    model_config = {"populate_by_name": True}
    type: str
    from_point: Optional[str] = Field(None, alias="from")
    to_point: Optional[str] = Field(None, alias="to")
    name: Optional[str] = None
    color: str = "black"
    style: str = "solid"

class Step(BaseModel):
    step_number: int
    explanation: str
    draw_elements: List[DrawElement]

class GeometryResponse(BaseModel):
    vertices: Dict[str, List[float]]
    edges: List[List[str]]
    steps: List[Step]
    hint: Optional[str] = None

# --- Prompt & logic từ gemini_spatial_parser.py ---
SYSTEM_PROMPT = """
Bạn là một chuyên gia Toán học Hình học Không gian và AI Backend Developer.
Nhiệm vụ của bạn là phân tích đề bài toán hình học không gian (Tiếng Việt) và chuyển đổi nó thành một cấu trúc JSON nghiêm ngặt để hiển thị 3D.

QUY TẮC TÍNH TOÁN TỌA ĐỘ (LUÔN TUÂN THỦ):
1. Hệ trục Oxyz: 
   - Đáy thường nằm trên mặt phẳng (Oxy), tức z=0.
   - Gốc tọa độ O(0,0,0) nên đặt tại một đỉnh của đáy (thường là A) hoặc tâm đáy.
2. Chiều dài các cạnh (Tỷ lệ tương đối):
   - Nếu đề bài cho "cạnh a", hãy coi a = 2.0.
   - Chiều cao hình chóp h = 3.0.
3. Các hình khối cơ bản:
   - Hình vuông ABCD đáy: A(0,0,0), B(2,0,0), C(2,2,0), D(0,2,0).
   - Hình chóp S.ABCD có SA ⊥ đáy: S(0,0,3).
4. Logic vẽ:
   - Một đường thẳng được coi là 'dashed' (nét đứt) nếu nó nằm bên trong hoặc bị các mặt khác che khuất.
"""

@app.post("/api/geometry/calculate", response_model=GeometryResponse)
def calculate_geometry(request: GeometryRequest):
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API chưa được cấu hình.")

    try:
        # Ví dụ JSON để AI bắt chước
        example_json = {
            "vertices": [{"name": "A", "x": 0.0, "y": 0.0, "z": 0.0}, {"name": "S", "x": 0.0, "y": 0.0, "z": 3.0}],
            "edges": [["A", "B"], ["S", "A"]],
            "steps": [{"step_number": 1, "explanation": "Vẽ đáy...", "draw_elements": [{"type": "line", "from": "A", "to": "B", "style": "dashed"}]}]
        }

        prompt = (
            f"{SYSTEM_PROMPT}\n\nĐề bài: {request.query}\n\n"
            f"Phản hồi JSON đúng schema như ví dụ: {json.dumps(example_json)}\n"
            f"HÃY ĐẢM BẢO `draw_elements` là danh sách các object."
        )

        # Thử lại tối đa 3 lần nếu gặp lỗi server (503, 429)
        max_retries = 3
        last_error = None
        
        for attempt in range(max_retries):
            try:
                response = gemini_client.models.generate_content(
                    model="gemini-3-flash-preview", 
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1
                    )
                )
                break # Thành công
            except Exception as e:
                last_error = e
                if "503" in str(e) or "429" in str(e):
                    logging.warning(f"Lỗi Gemini (Lần {attempt+1}/{max_retries}): {e}. Đang thử lại...")
                    time.sleep(2 * (attempt + 1)) # Backoff nhẹ
                    continue
                raise e # Lỗi khác thì báo luôn
        else:
            raise last_error

        raw_text = response.text.strip()
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[-1].split("```")[0].strip()
        
        data = json.loads(raw_text)
        
        # Transform vertices từ list sang dict cho frontend
        # Đổi trục tọa độ sang hệ Three.js: Trục Y thành chiều cao, mặt XZ làm đáy
        vertices_list = data.get("vertices", [])
        formatted_vertices = {v["name"]: [v["x"], v["z"], -v["y"]] for v in vertices_list}
        
        return GeometryResponse(
            vertices=formatted_vertices,
            edges=data.get("edges", []),
            steps=data.get("steps", []),
            hint=data.get("hint", "Xem các bước giải chi tiết phía dưới.")
        )
        
    except Exception as e:
        logging.error(f"Lỗi: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Không thể xử lý đề bài: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
