import os
import json
import logging
import base64
import random
from datetime import date
import sympy as sp
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types
import time

# Load challenge bank
_challenge_bank_path = os.path.join(os.path.dirname(__file__), 'challenge_bank.json')
try:
    with open(_challenge_bank_path, 'r', encoding='utf-8') as f:
        CHALLENGE_BANK = json.load(f)
except Exception:
    CHALLENGE_BANK = []

# Load biến môi trường
# Chỉ định rõ đường dẫn .env để tránh lỗi không tìm thấy khi chạy bat
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Khởi tạo Gemini client theo SDK mới nhất google-genai
gemini_client = None
if GEMINI_API_KEY and GEMINI_API_KEY != "your_api_key_here":
    try:
        # Sử dụng api_key trực tiếp hoặc qua env
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        logging.info("Gemini Client khởi tạo thành công.")
    except Exception as e:
        logging.warning(f"Không thể khởi tạo Gemini client: {e}")

app = FastAPI(
    title="SpatialMind API with Gemini AI",
    description="API cho ứng dụng SpatialMind, kết hợp Gemini và SymPy",
    version="v.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Cho phép Frontend từ Vercel truy cập
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GeometryRequest(BaseModel):
    query: str = Field(..., description="Đề bài ngôn ngữ tự nhiên từ học sinh")
    image: Optional[str] = Field(None, description="Dữ liệu ảnh base64 (nếu có)")

class DrawElement(BaseModel):
    model_config = {"populate_by_name": True}
    type: str  # "line", "point", "vector", "right_angle", "function"
    from_point: Optional[str] = Field(None, alias="from")
    to_point: Optional[str] = Field(None, alias="to")
    name: Optional[str] = None
    color: str = "black"
    style: str = "solid"

class Step(BaseModel):
    step_number: int
    explanation: str
    draw_elements: List[DrawElement]

# GeometryResponse is not used directly as return type in calculate_geometry but kept for reference
class GeometryResponse(BaseModel):
    type: str
    vertices: Dict[str, List[float]]
    edges: List[List[str]]
    vectors: List[Dict[str, Any]]
    functions: List[Dict[str, Any]]
    steps: List[Step]
    hint: Optional[str] = None

class SocraticRequest(BaseModel):
    problem_statement: str
    student_wrong_step: str
    theory_markdown: str

class SocraticResponse(BaseModel):
    analysis_internal: str
    socratic_question: str
    theory_applied: str

class AlgebraRequest(BaseModel):
    query: str

class AlgebraResponse(BaseModel):
    result_latex: str
    steps: List[str]
    function_string: Optional[str] = None # Dùng để backend gửi chuỗi hàm số cho frontend vẽ đồ thị

# --- Prompt & logic từ gemini_spatial_parser.py ---
# --- Prompt & logic upgrade ---
SYSTEM_PROMPT = """
Bạn là một chuyên gia Toán học và Visualizer.
Nhiệm vụ: Phân tích đề bài (Text + Image) và chuyển đổi thành cấu trúc JSON để hiển thị Toán học 2D/3D.

QUY TẮC HIỂN THỊ:
1. Nếu là Hình học không gian: type="3D", dùng vertices (object) và edges.
2. Nếu là Đồ thị hàm số: type="2D", dùng functions (mảng các biểu thức có tiền tố Math. ví dụ Math.sin(x)).
3. Nếu là Vector: Thêm vào mảng vectors.
4. Chế độ tọa độ 3D (Three.js):
   - Đỉnh thường đặt tại z=0 cho đáy. a=2.0, h=3.0 mặc định.
   - Nét đứt (style="dashed") cho các cạnh khuất.
5. Vẽ biểu tượng vuông góc: Dùng type="right_angle".
6. Tô màu cạnh: Trong mảng edges, thêm trường "color" để phân biệt:
   - Cạnh đáy chính: "color": "blue"
   - Cạnh bên: "color": "white"
   - Cạnh ẩn/phụ: "color": "gray"
   - Cạnh được highlight trong bài toán: "color": "red"
7. Đánh giá độ khó và ước tính XP phần thưởng (1-200): trả về field "xp_reward" (int).
8. Trả về "difficulty": "easy" | "medium" | "hard"

BẮT BUỘC TRẢ VỀ JSON KHÔNG CÓ TEXT DƯ QUY ĐỊNH SAU:
"""

MATH_JSON_SCHEMA = {
    "type": "string", # "3D" hoặc "2D"
    "vertices": {
        "type": "object",
        "additionalProperties": { "type": "array", "items": { "type": "number" }, "minItems": 3, "maxItems": 3 }
    },
    "edges": { "type": "array", "items": { "type": "array", "items": { "type": "string" } } },
    "vectors": {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "start": {"type": "array", "items": {"type": "number"}},
                "direction": {"type": "array", "items": {"type": "number"}},
                "length": {"type": "number"}
            }
        }
    },
    "functions": {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "expression": {"type": "string"},
                "color": {"type": "string"}
            }
        }
    },
    "steps": {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "step": {"type": "integer"},
                "hint": {"type": "string"}
            }
        }
    }
}


@app.post("/api/geometry/calculate")
def calculate_geometry(request: GeometryRequest):
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API chưa được cấu hình.")

    try:
        contents = [SYSTEM_PROMPT, f"Đề bài: {request.query}"]
        
        # Nếu có ảnh, đính kèm vào nội dung gửi cho Gemini
        if request.image:
            # Xử lý base64 string
            image_data = request.image
            if "data:image" in image_data:
                image_data = image_data.split(",")[1]
            contents.append(types.Part.from_bytes(data=base64.b64decode(image_data), mime_type="image/jpeg"))

        response = gemini_client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MATH_JSON_SCHEMA,
                temperature=0.1
            )
        )

        data = json.loads(response.text.strip())
        
        # Chuyển đổi tọa độ Oxyz của AI sang coordinate system của Three.js (Y là chiều cao)
        # Transformation: (x, y, z) AI -> (x, z, -y) Three.js
        raw_vertices = data.get("vertices", {})
        formatted_vertices = {}
        if isinstance(raw_vertices, dict):
            for name, coords in raw_vertices.items():
                if len(coords) == 3:
                    formatted_vertices[name] = [coords[0], coords[2], -coords[1]]

        # Chuyển đổi tọa độ cho Vectors (Sync with vertices)
        raw_vectors = data.get("vectors", [])
        formatted_vectors = []
        for vec in raw_vectors:
            start = vec.get("start", [0, 0, 0])
            direction = vec.get("direction", [1, 0, 0])
            if len(start) == 3 and len(direction) == 3:
                formatted_vectors.append({
                    "id": vec.get("id"),
                    "start": [start[0], start[2], -start[1]],
                    "direction": [direction[0], direction[2], -direction[1]],
                    "length": vec.get("length", 2)
                })

        return {
            "type": data.get("type", "3D"),
            "vertices": formatted_vertices,
            "edges": data.get("edges", []),
            "vectors": formatted_vectors,
            "functions": data.get("functions", []),
            "steps": data.get("steps", []),
            "hint": data.get("steps", [{}])[0].get("hint", "AI đã phân tích xong đề bài."),
            "xp_reward": data.get("xp_reward", 50),
            "difficulty": data.get("difficulty", "medium")
        }
        
    except Exception as e:
        logging.error(f"Lỗi: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Lỗi AI: {str(e)}")

# --- Algebra & SymPy Solver Endpoint ---
ALGEBRA_SOLVER_PROMPT = """
Bạn là một chuyên gia Toán học Đại số và Giải tích.
Nhiệm vụ của bạn là phân tích đề bài toán đại số (Tiếng Việt) và chuyển đổi nó thành các bước giải bằng SymPy.

Yêu cầu:
1. Xác định hàm số chính (nếu có) để frontend có thể vẽ đồ thị.
2. Giải toán từng bước.
3. Trả về kết quả cuối cùng dưới dạng LaTeX.

Đầu ra bắt buộc là JSON:
{
  "result_latex": "Kết quả cuối cùng dạng LaTeX (vd: \\frac{2x}{3})",
  "steps": ["Bước 1: ...", "Bước 2: ..."],
  "function_string": "Chuỗi hàm số chuẩn Python để vẽ đồ thị (vd: sin(x) + x**2). Nếu không có hàm số thì để null."
}
"""

@app.post("/api/algebra/solve", response_model=AlgebraResponse)
def solve_algebra(request: AlgebraRequest):
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API chưa được cấu hình.")
    
    try:
        response = gemini_client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=f"{ALGEBRA_SOLVER_PROMPT}\n\nĐề bài: {request.query}",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        
        data = json.loads(response.text.strip())
        
        # Ở đây chúng ta có thể thực hiện tính toán SymPy thực tế để kiểm chứng 
        # Ví dụ: Nếu có function_string, ta có thể dùng SymPy để tính đạo hàm thực tế
        if data.get("function_string"):
            try:
                x = sp.Symbol('x')
                # Lưu ý: eval() trong môi trường thực tế cần được kiểm soát chặt chẽ
                # Ở đây ta dùng sp.sympify để an toàn hơn
                expr = sp.sympify(data["function_string"])
                # Ví dụ: Luôn tính thêm đạo hàm để làm phong phú kết quả
                derivative = sp.diff(expr, x)
                data["steps"].append(f"Đạo hàm bổ sung bởi SymPy: ${sp.latex(derivative)}$")
            except Exception as se:
                logging.warning(f"SymPy Verification Error: {se}")

        return AlgebraResponse(
            result_latex=data.get("result_latex", ""),
            steps=data.get("steps", []),
            function_string=data.get("function_string")
        )
    except Exception as e:
        logging.error(f"Lỗi Algebra Solver: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Lỗi giải toán: {str(e)}")

# --- Socratic Tutor Endpoint ---
SOCRATIC_TUTOR_PROMPT = """
Bạn là một Chuyên gia Sư phạm Toán học Socratic (Socratic Math Tutor).
Nhiệm vụ của bạn là hướng dẫn học sinh nhận ra lỗi sai của chính mình thông qua các gợi ý và câu hỏi phản tư. 

NGUYÊN TẮC TỐI THƯỢNG: TUYỆT ĐỐI KHÔNG giải bài toán cho học sinh, KHÔNG ĐƯA RA đáp án cuối cùng.

Đầu vào sẽ bao gồm:
1. Đê bài: {problem}
2. Bước giải sai của học sinh: {wrong_step}
3. Trích đoạn lý thuyết liên quan (Markdown): {theory}

Yêu cầu:
- Sử dụng trích đoạn lý thuyết được cung cấp làm nền tảng kiến thức.
- Kết hợp phương pháp Socratic: Đặt ra MỘT câu hỏi gợi mở, hướng học sinh đối chiếu bài làm của mình với đoạn lý thuyết, từ đó tự nhận ra họ đã áp dụng sai quy tắc/công thức nào.
- Giọng văn: Khích lệ, thân thiện, mang tính gợi mở. Sử dụng LaTeX cho công thức toán.

Đầu ra bắt buộc là JSON theo định dạng sau:
{
  "analysis_internal": "Phân tích nội bộ của bạn xem học sinh sai ở đâu",
  "socratic_question": "Câu hỏi gợi mở Socratic viết bằng Markdown kết hợp LaTeX, là câu trực tiếp hỏi học sinh.",
  "theory_applied": "Tóm tắt tên lý thuyết đã dùng để gợi ý"
}
"""

@app.post("/api/socratic-hint", response_model=SocraticResponse)
def get_socratic_hint(request: SocraticRequest):
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API chưa được cấu hình.")
    
    try:
        prompt = SOCRATIC_TUTOR_PROMPT.format(
            problem=request.problem_statement,
            wrong_step=request.student_wrong_step,
            theory=request.theory_markdown
        )

        response = gemini_client.models.generate_content(
            model="gemini-3-flash-preview", 
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3
            )
        )

        raw_text = response.text.strip()
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[-1].split("```")[0].strip()
        
        data = json.loads(raw_text)
        
        return SocraticResponse(
            analysis_internal=data.get("analysis_internal", ""),
            socratic_question=data.get("socratic_question", ""),
            theory_applied=data.get("theory_applied", "")
        )
    except Exception as e:
        logging.error(f"Lỗi Socratic Hint: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Lỗi xử lý gợi ý: {str(e)}")


# --- Daily Challenge Endpoint ---
class DailyChallengeResponse(BaseModel):
    date: str
    challenges: List[Dict[str, Any]]

@app.get("/api/daily-challenge", response_model=DailyChallengeResponse)
def get_daily_challenge():
    """Trả về 3 bài toán ngẫu nhiên mỗi ngày (seed theo ngày để ai cũng có cùng bài)."""
    today = str(date.today())
    # Seed random theo ngày → cùng ngày cùng bài
    seed = int(today.replace('-', ''))
    rng = random.Random(seed)
    
    if not CHALLENGE_BANK:
        raise HTTPException(status_code=500, detail="Challenge bank trống.")
    
    # Chọn 1 easy, 1 medium, 1 hard
    easy = [c for c in CHALLENGE_BANK if c['difficulty'] == 'easy']
    medium = [c for c in CHALLENGE_BANK if c['difficulty'] == 'medium']
    hard = [c for c in CHALLENGE_BANK if c['difficulty'] == 'hard']
    
    selected = []
    if easy: selected.append(rng.choice(easy))
    if medium: selected.append(rng.choice(medium))
    if hard: selected.append(rng.choice(hard))
    
    # Fallback nếu thiếu
    while len(selected) < 3 and CHALLENGE_BANK:
        selected.append(rng.choice(CHALLENGE_BANK))
    
    return DailyChallengeResponse(date=today, challenges=selected[:3])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
