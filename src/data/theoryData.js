// Auto-extracted from HOCMAI "100 Ngày Phá Kén" worksheets
export const THEORY_CHAPTERS = [
  {
    id: 'gioi-han',
    title: 'Xử đẹp Giới hạn vô định 0/0',
    category: 'Giải tích',
    icon: '📐',
    source: 'Buổi 01',
    content: `## Giới hạn dạng vô định 0/0

**Bài toán:** Tính giới hạn $L = \\lim_{x \\to x_0} \\frac{f(x)}{g(x)}$ với $f(x_0) = g(x_0) = 0$

### Phương pháp giải
Ý tưởng chung: phân tích thành tích để khử dạng vô định.

$$L = \\lim_{x \\to x_0} \\frac{(x-x_0)^n \\cdot h(x)}{(x-x_0)^m \\cdot k(x)}$$

- Nếu $m = n$: $L = \\frac{h(x_0)}{k(x_0)}$
- Nếu $m > n$: $L = 0$
- Nếu $m < n$: $L = \\pm\\infty$

### Các hướng xử lý

**Hướng 1:** Nếu tử và mẫu là đa thức → phân tích nhân tử (chia Horner).

**Hướng 2:** Nếu có căn thức → nhân liên hợp:
- Căn bậc hai: $(A-B)(A+B) = A^2 - B^2$
- Căn bậc ba: $(A \\mp B)(A^2 \\pm AB + B^2) = A^3 \\mp B^3$

**Hướng 3:** Nếu có hai căn khác bậc hoặc hàm khác tính chất → kĩ thuật "chia để trị".

**Hướng 4:** Nếu có lượng giác → sử dụng $\\lim_{u \\to 0} \\frac{\\sin u}{u} = 1$

### Chú ý
- **Quy tắc L'Hôpital:** $L = \\lim_{x \\to x_0} \\frac{f'(x)}{g'(x)}$
- Có thể dùng **Casio** để kiểm tra kết quả.`,
    exercises: [
      {
        id: 'gh-1',
        problem: 'Cho giới hạn $L = \\lim_{x \\to 1} \\frac{x^2 + 2025x - 2026}{x^3 + x^2 + x - 3}$. Khẳng định nào đúng?',
        options: ['$L = 338$', '$L = \\frac{2027}{6}$', '$L = 2027$', '$L = +\\infty$'],
        answer: 0,
        difficulty: 'medium',
        source: 'HOCMAI Buổi 01',
        xp: 100,
      },
      {
        id: 'gh-2',
        problem: '(TSA – Đợt 1 – 2026) Cho $I = \\lim_{x \\to 0} \\frac{1 - \\cos^2 x}{x^n}$. Nếu $n=1$ thì $I = ?$. Nếu $n=2$ thì $I = ?$.',
        options: ['$I=0; I=1$', '$I=0; I=2$', '$I=1; I=0$', '$I=2; I=1$'],
        answer: 0,
        difficulty: 'hard',
        source: 'TSA 2026',
        xp: 150,
      },
      {
        id: 'gh-3',
        problem: '(HSA – 2025) Giới hạn $\\lim_{x \\to 2^-} \\frac{x^3 - 6x^2 + 8x}{x^2 - 4x + 4}$ bằng bao nhiêu?',
        options: ['$0$', '$13$', '$+\\infty$', '$-\\infty$'],
        answer: 3,
        difficulty: 'hard',
        source: 'HSA 2025',
        xp: 150,
      },
    ],
  },
  {
    id: 'doc-hieu',
    title: 'Kĩ năng đọc hiểu thiết yếu trong bài thi Toán',
    category: 'Phương pháp',
    icon: '📖',
    source: 'Buổi 02',
    content: `## Kĩ năng đọc hiểu trong bài thi Toán

### Nguyên tắc cốt lõi
1. **Đọc kỹ đề bài:** Xác định rõ dữ kiện, yêu cầu.
2. **Nhận diện dạng toán:** Phân loại bài toán thuộc chủ đề nào.
3. **Chuyển đổi ngôn ngữ:** Từ ngôn ngữ tự nhiên sang ngôn ngữ toán học.
4. **Kiểm tra điều kiện:** Xác định miền xác định, điều kiện ràng buộc.

### Các bẫy thường gặp
- Nhầm lẫn giữa "lớn hơn" và "lớn hơn hoặc bằng"
- Bỏ sót điều kiện xác định
- Không kiểm tra đáp án với đề bài gốc`,
    exercises: [],
  },
  {
    id: 'goc-dt-mp',
    title: 'Góc giữa đường thẳng và mặt phẳng',
    category: 'Hình học không gian',
    icon: '📐',
    source: 'Buổi 05-06',
    content: `## Góc giữa đường thẳng và mặt phẳng

### Định nghĩa
Góc giữa đường thẳng $d$ và mặt phẳng $(P)$ là góc giữa $d$ và hình chiếu vuông góc $d'$ của nó trên $(P)$.

$$\\cos \\alpha = \\frac{|\\vec{a} \\cdot \\vec{n}|}{|\\vec{a}| \\cdot |\\vec{n}|}$$

Nếu $d \\perp (P)$ thì góc bằng $90°$.

### Phương pháp tìm góc
1. **Xác định hình chiếu** của đường thẳng lên mặt phẳng.
2. **Tìm chân đường vuông góc** từ một điểm trên đường thẳng đến mặt phẳng.
3. **Tính góc** bằng tam giác vuông hoặc tích vô hướng.

### Công thức nhanh
- Hình chóp đều $S.ABCD$: góc giữa cạnh bên và đáy = $\\arctan\\frac{h}{R}$ (R = khoảng cách từ tâm đáy đến chân cạnh bên).`,
    exercises: [
      {
        id: 'goc-1',
        problem: 'Cho hình chóp $S.ABC$ có cạnh $SA$ vuông góc với đáy. Góc giữa $SB$ và mặt phẳng đáy là góc giữa hai đường thẳng nào?',
        options: ['$SB$ và $SC$', '$SB$ và $AB$', '$SA$ và $SB$', '$SB$ và $BC$'],
        answer: 1,
        difficulty: 'easy',
        source: 'HOCMAI Buổi 05',
        xp: 50,
      },
      {
        id: 'goc-2',
        problem: "Cho hình lăng trụ đứng $ABC.A'B'C'$ có đáy tam giác vuông cân tại $A$, $AB = AA' = a$. Tính $\\tan$ của góc giữa $BC'$ và mặt phẳng $(ABB'A')$.",
        options: ['$\\frac{1}{\\sqrt{2}}$', '$\\frac{\\sqrt{2}}{2}$', '$1$', '$\\sqrt{2}$'],
        answer: 1,
        difficulty: 'medium',
        source: 'HOCMAI Buổi 05',
        xp: 100,
      },
      {
        id: 'goc-3',
        problem: 'Cho hình chóp tứ giác đều $S.ABCD$ có tất cả các cạnh bằng $a$. Gọi $M$ là trung điểm $SD$. Góc giữa $SC$ và mặt đáy $(ABCD)$ bằng bao nhiêu?',
        options: ['$30°$', '$45°$', '$60°$', '$90°$'],
        answer: 1,
        difficulty: 'medium',
        source: 'HOCMAI Buổi 05',
        xp: 100,
      },
      {
        id: 'goc-4',
        problem: 'Cho hình chóp $S.ABCD$ có đáy vuông cạnh $a$, $SA \\perp (ABCD)$, $SA = \\frac{a\\sqrt{2}}{2}$. Tính $\\tan$ của góc giữa $SC$ và $(ABCD)$.',
        options: ['$0.58$', '$0.71$', '$1.00$', '$1.41$'],
        answer: 1,
        difficulty: 'hard',
        source: 'HOCMAI Buổi 05',
        xp: 130,
      },
    ],
  },
  {
    id: 'mu-logarit',
    title: 'Hệ thống hóa & Bứt tốc chủ đề Mũ – Logarit',
    category: 'Giải tích',
    icon: '📊',
    source: 'Buổi 07',
    content: `## Mũ – Logarit

### Công thức cơ bản
$$a^m \\cdot a^n = a^{m+n}, \\quad \\frac{a^m}{a^n} = a^{m-n}, \\quad (a^m)^n = a^{mn}$$

### Logarit
$$\\log_a b = c \\Leftrightarrow a^c = b \\quad (a > 0, a \\neq 1, b > 0)$$

### Công thức đổi cơ số
$$\\log_a b = \\frac{\\ln b}{\\ln a} = \\frac{\\log_c b}{\\log_c a}$$

### Tính chất
- $\\log_a(xy) = \\log_a x + \\log_a y$
- $\\log_a \\frac{x}{y} = \\log_a x - \\log_a y$
- $\\log_a x^n = n \\cdot \\log_a x$
- $\\frac{1}{\\log_{ab} b} = 1 + \\log_a b$`,
    exercises: [
      {
        id: 'log-1',
        problem: 'Cho $a, b, c$ là các số thực khác $0$ thỏa mãn $4^a = 25^b = 10^c$. Tính $T = \\frac{c}{a} + \\frac{c}{b}$.',
        options: ['$1$', '$2$', '$3$', '$4$'],
        answer: 1,
        difficulty: 'medium',
        source: 'HOCMAI Buổi 07',
        xp: 100,
      },
      {
        id: 'log-2',
        problem: 'Cho $x, y, z > 1$, $\\log_x w = 24$, $\\log_y w = 40$, $\\log_{xyz} w = 12$. Tính $\\log_z w$.',
        options: ['$40$', '$50$', '$60$', '$80$'],
        answer: 2,
        difficulty: 'hard',
        source: 'HOCMAI Buổi 07',
        xp: 150,
      },
      {
        id: 'log-3',
        problem: 'Có tất cả bao nhiêu giá trị nguyên của $m$ để hàm số $y = \\ln(x^2 - 2mx + 12m - 20)$ có tập xác định là $\\mathbb{R}$?',
        options: ['$3$', '$4$', '$5$', '$6$'],
        answer: 2,
        difficulty: 'medium',
        source: 'HOCMAI Buổi 07',
        xp: 100,
      },
    ],
  },
  {
    id: 'logic-tinh-huong',
    title: 'Lập bảng – Vũ khí của bài toán Logic tình huống',
    category: 'Phương pháp',
    icon: '🧩',
    source: 'Buổi 08',
    content: `## Bài toán Logic tình huống

### Phương pháp lập bảng
1. **Xác định biến:** Liệt kê tất cả các biến và ràng buộc.
2. **Lập bảng giá trị:** Tạo bảng với các trường hợp có thể xảy ra.
3. **Loại trừ:** Dựa vào điều kiện để loại bỏ các trường hợp không thỏa mãn.
4. **Kết luận:** Xác định đáp án từ các trường hợp còn lại.

### Mẹo
- Vẽ sơ đồ Venn khi có nhiều tập hợp.
- Sử dụng biến đếm khi bài toán yêu cầu "bao nhiêu".`,
    exercises: [],
  },
  {
    id: 'xac-suat',
    title: 'Từ Xác suất cổ điển đến quy tắc tính XS',
    category: 'Xác suất – Thống kê',
    icon: '🎲',
    source: 'Buổi 11-13',
    content: `## Xác suất

### Xác suất cổ điển
$$P(A) = \\frac{|A|}{|\\Omega|}$$

### Quy tắc cộng
Nếu $A \\cap B = \\emptyset$: $P(A \\cup B) = P(A) + P(B)$

### Quy tắc nhân
Nếu $A, B$ độc lập: $P(A \\cap B) = P(A) \\cdot P(B)$

### Xác suất có điều kiện
$$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$

### Công thức Bernoulli
$$P(X = k) = C_n^k \\cdot p^k \\cdot (1-p)^{n-k}$$`,
    exercises: [],
  },
  {
    id: 'khoang-cach-cheo',
    title: 'Khoảng cách giữa hai đường thẳng chéo nhau',
    category: 'Hình học không gian',
    icon: '📏',
    source: 'Buổi 15-16',
    content: `## Khoảng cách giữa hai đường thẳng chéo nhau

### Phương pháp
1. **Tìm đường vuông góc chung:** Đường thẳng vuông góc với cả hai đường thẳng chéo nhau.
2. **Dùng mặt phẳng song song:** Nếu $a$ và $b$ chéo nhau, tìm $(P) \\supset a$ và $(P) \\parallel b$, thì $d(a,b) = d(b, (P))$.
3. **Dùng thể tích:** $d(a,b) = \\frac{6V}{S \\cdot l}$ (với $V$ là thể tích tứ diện, $S$ là diện tích đáy, $l$ là cạnh đối diện).

### Ví dụ mẫu
Hình chóp $S.ABCD$, đáy vuông cạnh $a$, $SA \\perp (ABCD)$, $SA = 2a$:
- $d(SA, CD) = a$
- $d(SA, BC) = a$
- $d(SA, BD)$: dùng mp $(SAC) \\parallel BD$`,
    exercises: [
      {
        id: 'kc-1',
        problem: 'Cho hình chóp $S.ABCD$, đáy vuông cạnh $a$, $SA \\perp (ABCD)$, $SA = 2a$. Tính $d(SA, BC)$.',
        options: ['$a$', '$a\\sqrt{2}$', '$2a$', '$\\frac{a}{2}$'],
        answer: 0,
        difficulty: 'medium',
        source: 'HOCMAI Buổi 15',
        xp: 100,
      },
      {
        id: 'kc-2',
        problem: 'Cho hình chóp $S.ABCD$, đáy vuông, $SA = 2a$, góc giữa $SC$ và $(ABCD)$ là $30°$, $SA \\perp (ABCD)$. Tính $d(SA, BD)$.',
        options: ['$a\\sqrt{3}$', '$a\\sqrt{6}$', '$2a\\sqrt{3}$', '$\\frac{a\\sqrt{6}}{2}$'],
        answer: 1,
        difficulty: 'hard',
        source: 'HOCMAI Buổi 15',
        xp: 150,
      },
    ],
  },
  {
    id: 'on-tap-hk2',
    title: 'Đề ôn tập học kì II – Hành trình kiến thức',
    category: 'Tổng hợp',
    icon: '🏆',
    source: 'Buổi 18',
    content: `## Đề ôn tập tổng hợp HK2

Bao gồm các chủ đề:
- Giới hạn và liên tục
- Đạo hàm
- Mũ – Logarit
- Hình học không gian
- Xác suất – Thống kê

### Chiến lược làm bài
1. Làm nhanh câu dễ trước (câu 1-30)
2. Phân bổ thời gian hợp lý cho câu trắc nghiệm đúng sai
3. Câu trả lời ngắn: kiểm tra kỹ đơn vị và kết quả`,
    exercises: [],
  },
];

export const ALL_EXERCISES = THEORY_CHAPTERS.flatMap(ch =>
  ch.exercises.map(ex => ({ ...ex, chapter: ch.title, chapterId: ch.id }))
);

export const CATEGORIES = [...new Set(THEORY_CHAPTERS.map(ch => ch.category))];
