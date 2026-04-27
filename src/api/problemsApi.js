// =====================================================
// Mock API cho Problems và User Progress
// Thay thế bằng fetch thật từ Firestore khi có backend
// =====================================================

export const MOCK_PROBLEMS = [
  {
    id: "tinh-the-tich-khoi-chop-s-abcd",
    title: "1. Tính thể tích khối chóp S.ABCD",
    difficulty: "Medium",
    tags: ["Hình học không gian", "Thể tích"],
    acceptanceRate: 45.2,
    totalSubmissions: 1250,
    isPremium: false,
    content: "Cho khối chóp S.ABCD có đáy là hình vuông cạnh $a$, SA vuông góc với đáy, $SA = a\\sqrt{2}$. Tính thể tích khối chóp."
  },
  {
    id: "bai-toan-mat-cau-02",
    title: "2. Xác định tâm và bán kính mặt cầu ngoại tiếp",
    difficulty: "Hard",
    tags: ["Mặt cầu", "Ngoại tiếp"],
    acceptanceRate: 20.5,
    totalSubmissions: 3400,
    isPremium: false,
    content: "Cho tứ diện ABCD có ba cạnh AB, AC, AD đôi một vuông góc. Tìm tâm mặt cầu ngoại tiếp tứ diện."
  },
  {
    id: "khoang-cach-hai-duong-cheo-nhau",
    title: "3. Khoảng cách giữa 2 đường thẳng chéo nhau",
    difficulty: "Hard",
    tags: ["Hình học không gian", "Khoảng cách"],
    acceptanceRate: 15.3,
    totalSubmissions: 890,
    isPremium: true,
    content: "Cho hình lập phương ABCD.A'B'C'D' cạnh $a$. Tính khoảng cách giữa AC và B'D'."
  },
  {
    id: "hinh-lang-tru-tam-giac",
    title: "4. Tính diện tích toàn phần lăng trụ đứng",
    difficulty: "Easy",
    tags: ["Lăng trụ", "Diện tích"],
    acceptanceRate: 85.0,
    totalSubmissions: 5000,
    isPremium: false,
    content: "Tính diện tích toàn phần của lăng trụ tam giác đều có tất cả các cạnh bằng $a$."
  },
  {
    id: "goc-giua-duong-va-mat",
    title: "5. Góc giữa đường thẳng và mặt phẳng",
    difficulty: "Medium",
    tags: ["Góc"],
    acceptanceRate: 55.4,
    totalSubmissions: 2100,
    isPremium: false,
    content: "Cho hình chóp tam giác đều S.ABC có cạnh đáy bằng $a$, cạnh bên bằng $2a$. Tính góc giữa SA và (ABC)."
  }
];

export const MOCK_USER_PROGRESS = {
  solvedProblems: ["tinh-the-tich-khoi-chop-s-abcd", "bai-toan-mat-cau-02"],
  attemptedProblems: ["khoang-cach-hai-duong-cheo-nhau"]
};

// Hàm mô phỏng độ trễ của API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchProblems = async () => {
  await delay(600); // Simulate network latency
  // Trả về metadata, bỏ content để nhẹ
  return MOCK_PROBLEMS.map(({ content, ...meta }) => meta);
};

export const fetchProblemById = async (id) => {
  await delay(400); // Simulate network latency
  const problem = MOCK_PROBLEMS.find(p => p.id === id);
  if (!problem) throw new Error("Problem not found");
  return problem;
};

export const fetchUserProgress = async (uid) => {
  await delay(400); // Simulate network latency
  // Trong thực tế sẽ fetch bằng uid
  return MOCK_USER_PROGRESS;
};
