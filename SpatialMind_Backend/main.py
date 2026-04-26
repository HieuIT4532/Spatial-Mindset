import os
import json
import urllib.request
import urllib.error
import logging
import base64
import random
from datetime import date
import sympy as sp
from fastapi import FastAPI, HTTPException, Request

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional, Union
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

# ----------------- Rate Limiting Middleware -----------------
ip_last_request = {}
RATE_LIMIT_SECONDS = 10

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Các endpoint cần giới hạn
    limited_endpoints = [
        "/api/geometry/calculate", 
        "/api/algebra/solve", 
        "/api/socratic-hint"
    ]
    
    if request.url.path in limited_endpoints:
        # Lấy IP thật của client (hỗ trợ proxy như Render/Cloudflare)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
            
        current_time = time.time()
        
        if client_ip in ip_last_request:
            time_passed = current_time - ip_last_request[client_ip]
            if time_passed < RATE_LIMIT_SECONDS:
                wait_time = int(RATE_LIMIT_SECONDS - time_passed)
                return JSONResponse(
                    status_code=429,
                    content={"detail": f"Hệ thống đang chống quá tải. Vui lòng đợi {wait_time} giây trước khi đặt câu hỏi tiếp theo."}
                )
        
        # Cập nhật thời gian request mới nhất cho IP này
        ip_last_request[client_ip] = current_time

    response = await call_next(request)
    return response
# -----------------------------------------------------------

class GeometryRequest(BaseModel):
    query: str = Field(..., description="Đề bài ngôn ngữ tự nhiên từ học sinh")
    image: Optional[str] = Field(None, description="Dữ liệu ảnh base64 (nếu có)")

class DrawElement(BaseModel):
    model_config = ConfigDict(extra='ignore', populate_by_name=True)
    type: str  # "line", "point", "vector", "right_angle", "function"
    from_point: Optional[Union[str, List[Any], Any]] = Field(None, alias="from")
    to_point: Optional[Union[str, List[Any], Any]] = Field(None, alias="to")
    name: Optional[str] = None
    color: str = "black"
    style: str = "solid"

class VectorRec(BaseModel):
    model_config = ConfigDict(extra='ignore')
    id: str = Field(..., description="ID vector")
    start: List[float] = Field(default=[0,0,0], description="Gốc")
    direction: List[float] = Field(..., description="Hướng")
    length: float = Field(2.0, description="Độ dài")

class FunctionRec(BaseModel):
    model_config = ConfigDict(extra='ignore')
    expression: str = Field(..., description="Biểu thức hàm số (vd: 'Math.sin(x)')")
    color: str = Field("blue", description="Màu đồ thị")

class VertexRec(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: str = Field(..., description="Tên đỉnh (vd: 'A')")
    coords: List[float] = Field(..., description="Tọa độ [x, y, z]")

class Step(BaseModel):
    model_config = ConfigDict(extra='ignore')
    step_number: int = Field(..., description="Thứ tự bước giải")
    explanation: str = Field(..., description="Giải thích chi tiết cho bước này")
    hint: str = Field(..., description="Gợi ý ngắn gọn cho học sinh")
    draw_elements: List[DrawElement] = Field(default_factory=list, description="Thành phần cần vẽ thêm trong bước này")

class QuizRec(BaseModel):
    model_config = ConfigDict(extra='ignore')
    question: str = Field(..., description="Câu hỏi trắc nghiệm cuối cùng dạng LaTeX")
    options: List[str] = Field(..., description="4 đáp án A, B, C, D (đã xáo trộn)")
    correct_index: int = Field(..., description="Index của đáp án đúng (0-3)")

class GeometryResponseOutput(BaseModel):
    model_config = ConfigDict(extra='ignore')
    type: str = Field(..., description="'3D' cho hình học không gian, '2D' cho đồ thị")
    vertices: List[VertexRec] = Field(default_factory=list, description="Danh sách các đỉnh")
    edges: List[List[str]] = Field(default_factory=list, description="Danh sách các cạnh [ ['A', 'B'], ['B', 'C'] ]")
    vectors: List[VectorRec] = Field(default_factory=list, description="Danh sách vector")
    functions: List[FunctionRec] = Field(default_factory=list, description="Công thức hàm số cho 2D")
    steps: List[Step] = Field(default_factory=list, description="Các bước giải chi tiết")
    hint: str = Field(..., description="Lời khuyên tổng quan cho cả đề bài")
    xp_reward: int = Field(50, description="XP phần thưởng (10-200)")
    difficulty: str = Field("medium", description="Độ khó: easy, medium, hard")
    final_quiz: Optional[QuizRec] = Field(None, description="Câu hỏi trắc nghiệm cuối cùng (tự sinh)")

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
# Schema definition is now handled by Pydantic models above (GeometryResponseOutput)



@app.post("/api/geometry/calculate")
def calculate_geometry(request: GeometryRequest):
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API chưa được cấu hình.")

    try:
        system_instruction = """Bạn là một chuyên gia Toán học và Visualizer cao cấp. 
Nhiệm vụ: Phân tích đề bài (Text + Image) và chuyển đổi thành cấu trúc JSON để hiển thị Toán học 2D/3D sinh động.

BẮT BUỘC TRẢ VỀ JSON THEO CẤU TRÚC:
{
  "type": "3D" hoặc "2D",
  "vertices": [ {"name": "A", "coords": [x,y,z]}, ... ],
  "edges": [ ["A", "B", "color"], ... ],
  "vectors": [ {"id": "v1", "start": [0,0,0], "direction": [1,1,1], "length": 2}, ... ],
  "functions": [ {"expression": "Math.sin(x)", "color": "blue"}, ... ],
  "steps": [
    {
      "step_number": 1,
      "explanation": "Giải thích chi tiết bằng Markdown + LaTeX",
      "hint": "Gợi ý ngắn",
      "draw_elements": [ {"type": "line", "from": "A", "to": "B", "color": "red", "style": "solid/dashed"}, ... ]
    }
  ],
  "hint": "Lời khuyên tổng quan",
  "xp_reward": 50,
  "difficulty": "easy/medium/hard",
  "final_quiz": {
    "question": "Câu hỏi trắc nghiệm chốt lại kiến thức quan trọng nhất hoặc kết quả cuối cùng (dạng LaTeX)",
    "options": ["A. $...$", "B. $...$", "C. $...$", "D. $...$"],
    "correct_index": 0
  }
}

4. XP Reward: Dựa trên độ phức tạp (Easy: 30-50, Medium: 60-100, Hard: 120-200).
5. JSON ESCAPING: BẮT BUỘC escape tất cả dấu gạch chéo ngược (\\) trong LaTeX thành gạch chéo ngược kép (\\\\).
6. DRAW ELEMENTS: Trong "draw_elements", trường "from" và "to" BẮT BUỘC phải là TÊN ĐỈNH (ví dụ: "A", "B"), KHÔNG ĐƯỢC để tọa độ [x,y,z] vào đây."""

        contents = [f"Đề bài: {request.query}"]
        if request.image:
            image_data = request.image.split(",")[-1] if "," in request.image else request.image
            contents.append(types.Part.from_bytes(data=base64.b64decode(image_data), mime_type="image/jpeg"))

        #Retry mechanism for Gemini API
        max_retries = 3
        last_error = None
        response = None

        for attempt in range(max_retries):
            try:
                response = gemini_client.models.generate_content(
                    model="gemini-3-flash-preview", 
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        response_mime_type="application/json",
                        temperature=0.1
                    )
                )
                break
            except Exception as e:
                last_error = e
                error_msg = str(e)
                if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                    wait_time = (2 ** attempt) + random.random()
                    logging.warning(f"Gemini Rate Limit hit. Retrying in {wait_time:.2f}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                elif "503" in error_msg or "Service Unavailable" in error_msg:
                    wait_time = 1 + random.random()
                    logging.warning(f"Gemini Service Unavailable. Retrying in {wait_time:.2f}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                else:
                    raise e
        else:
            if last_error:
                logging.error(f"Gemini max retries reached: {last_error}")
                raise HTTPException(status_code=429, detail="AI đang bận (Quá giới hạn lượt gọi). Vui lòng đợi 1 phút rồi thử lại.")

        if not response:
             raise HTTPException(status_code=500, detail="Không nhận được phản hồi từ AI.")

        # Cleanup and Parse
        response_text = response.text.strip()
        # Loại bỏ các đoạn bọc ```json ... ``` nếu có (đề phòng)
        if response_text.startswith("```"):
            response_text = response_text.split("```json")[-1].split("```")[0].strip()
        
        # Hardening: Tự động sửa lỗi escape phổ biến cho LaTeX nếu AI quên
        # Thay thế \ (không được escape) bằng \\
        # Regex này tìm các dấu \ đứng trước một ký tự đặc biệt của LaTeX nhưng không phải là \\
        import re
        # Sửa các trường hợp \frac, \sqrt, \alpha... mà quên double backslash
        # Nhưng tránh sửa các dấu \ đã được escape sẵn (\\)
        response_text = re.sub(r'(?<!\\)\\(?=[a-zA-Z{}])', r'\\\\', response_text)
        
        # Đảm bảo các ký tự đặc biệt lồng nhau được xử lý đúng
        response_text = response_text.replace('\\\\ ', '\\\\') 

        data_raw = json.loads(response_text)
        
        # Thử parse qua Pydantic, nếu lỗi thì dùng raw data để tránh crash
        try:
            data_obj = GeometryResponseOutput(**data_raw)
            data = data_obj.model_dump()
        except Exception as ve:
            logging.warning(f"Pydantic Validation Error (using raw data): {ve}")
            data = data_raw
        
        # Chuyển đổi List[VertexRec] ngược lại thành Dict cho frontend
        formatted_vertices = {}
        for v in data.get("vertices", []):
            coords = v.get("coords", [0, 0, 0])
            if coords and len(coords) >= 3:
                # Transformation: (x, y, z) AI -> (x, z, -y) Three.js
                formatted_vertices[v["name"]] = [coords[0], coords[2], -coords[1]]
            elif coords and len(coords) == 2:
                # Fallback cho 2D vertices trả về trong 3D context
                formatted_vertices[v["name"]] = [coords[0], 0, -coords[1]]
        
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
            "hint": data.get("hint", "AI đã phân tích xong đề bài."),
            "xp_reward": data.get("xp_reward", 50),
            "difficulty": data.get("difficulty", "medium"),
            "final_quiz": data.get("final_quiz")
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

  "steps": ["Bước 1: ...", "Bước 2: ..."],
  "function_string": "Chuỗi hàm số chuẩn Python để vẽ đồ thị (vd: sin(x) + x**2). Nếu không có hàm số thì để null."
}

BẮT BUỘC: Hợp lệ JSON 100%. Mọi dấu gạch chéo ngược trong LaTeX phải được escape kép (\\\\).
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
        
        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```json")[-1].split("```")[0].strip()
        
        import re
        response_text = re.sub(r'(?<!\\)\\(?=[a-zA-Z{}])', r'\\\\', response_text)
        
        data = json.loads(response_text)
        
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


# --- AppData Storage Logic ---
def get_appdata_dir():
    if os.name == 'nt': # Windows
        base_dir = os.getenv('APPDATA')
    else: # Linux/Mac
        base_dir = os.path.expanduser('~')
    
    app_dir = os.path.join(base_dir, 'SpatialMind')
    if not os.path.exists(app_dir):
        os.makedirs(app_dir)
    return app_dir

def load_json_data(filename, default_value):
    path = os.path.join(get_appdata_dir(), filename)
    if not os.path.exists(path):
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(default_value, f, ensure_ascii=False, indent=2)
        return default_value
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return default_value

def save_json_data(filename, data):
    path = os.path.join(get_appdata_dir(), filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# --- User Endpoints ---
class UserProfile(BaseModel):
    name: str = "Học sinh"
    xp: int = 0
    streak: int = 0
    level: int = 1
    rank: str = "Beginner"
    achievements: List[str] = []

@app.get("/api/user/profile")
def get_profile():
    return load_json_data('user_profile.json', UserProfile().model_dump())

@app.post("/api/user/profile")
def update_profile(profile: UserProfile):
    save_json_data('user_profile.json', profile.model_dump())
    return {"status": "success"}

@app.get("/api/leaderboard")
def get_leaderboard():
    # Mock data kết hợp với user thực tế
    default_board = [
        {"name": "Minh Tú", "weeklyXP": 1240, "rank": "Diamond"},
        {"name": "Hà Linh", "weeklyXP": 980, "rank": "Platinum"},
        {"name": "Đức Khải", "weeklyXP": 870, "rank": "Platinum"},
    ]
    user_data = load_json_data('user_profile.json', UserProfile().model_dump())
    # Thêm user hiện tại vào board
    board = default_board + [{"name": user_data['name'], "weeklyXP": int(user_data['xp'] * 0.6), "rank": user_data['rank']}]
    return sorted(board, key=lambda x: x['weeklyXP'], reverse=True)

# --- Gemini Chat Proxy Endpoint ---
# Proxy chuyển tiếp request từ Frontend sang Google Gemini API
# API Key được bảo mật trên server, Frontend không cần biết key

class ChatProxyRequest(BaseModel):
    contents: List[Dict[str, Any]]
    generationConfig: Optional[Dict[str, Any]] = None
    systemInstruction: Optional[Dict[str, Any]] = None
    safetySettings: Optional[List[Dict[str, Any]]] = None

@app.post("/api/chat")
async def proxy_chat(request: Request):
    """Proxy endpoint chuyển tiếp request sang Google Gemini API.
    Hỗ trợ fallback qua nhiều model khi bị giới hạn quota."""
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_api_key_here":
        raise HTTPException(status_code=500, detail="Gemini API Key chưa được cấu hình trên server.")
    
    try:
        post_data = await request.body()
    except Exception:
        raise HTTPException(status_code=400, detail="Không thể đọc dữ liệu request.")
    
    # Danh sách các mô hình dự phòng khi bị giới hạn Quota
    models = [
        "gemini-2.0-flash",
        "gemini-2.5-flash", 
        "gemini-flash-latest", 
        "gemini-pro-latest"
    ]
    
    last_error_code = 500
    last_error_body = {"error": {"message": "Unknown error"}}
    
    for model_name in models:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        req = urllib.request.Request(
            endpoint, 
            data=post_data, 
            headers={'Content-Type': 'application/json'}
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                body = response.read()
                return JSONResponse(
                    status_code=200, 
                    content=json.loads(body)
                )
        except urllib.error.HTTPError as e:
            last_error_code = e.code
            try:
                error_body = e.read()
                last_error_body = json.loads(error_body)
            except Exception:
                pass
            
            logging.warning(f"[Chat Proxy] [{model_name}] API Error {e.code}. Chuyển sang model tiếp theo...")
            continue
        except Exception as e:
            last_error_code = 500
            last_error_body = {"error": {"message": str(e)}}
            logging.error(f"[Chat Proxy] [{model_name}] Exception: {e}")
            continue
    
    # Nếu tất cả các mô hình đều thất bại
    return JSONResponse(status_code=last_error_code, content=last_error_body)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
