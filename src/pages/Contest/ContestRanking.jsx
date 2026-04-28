import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowLeft, Trophy, Search } from 'lucide-react';

// Mock Custom Hook for Firebase
const useLiveRanking = (contestId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập onSnapshot từ Firebase Firestore
    setLoading(true);

    // Khởi tạo data ban đầu
    const initialData = [
      {
        id: 'user1',
        rank: 1,
        username: 'HieuIT',
        avatar: 'H',
        score: 18, // 3 + 4 + 5 + 6
        finishTime: '01:12:45',
        q1: { status: 'AC', time: '00:05:12', penalty: 0 },
        q2: { status: 'AC', time: '00:15:30', penalty: 1 }, // 🐞 1
        q3: { status: 'AC', time: '00:32:10', penalty: 0 },
        q4: { status: 'AC', time: '01:07:45', penalty: 0 },
      },
      {
        id: 'user2',
        rank: 2,
        username: 'QuocHan',
        avatar: 'A',
        score: 12, // 3 + 4 + 5
        finishTime: '01:25:10',
        q1: { status: 'AC', time: '00:10:05', penalty: 0 },
        q2: { status: 'AC', time: '00:25:40', penalty: 0 },
        q3: { status: 'AC', time: '00:55:10', penalty: 2 }, // 🐞 2
        q4: { status: null, time: null, penalty: 0 },
      },
      {
        id: 'user3',
        rank: 3,
        username: 'DucDung',
        avatar: 'B',
        score: 7, // 3 + 4
        finishTime: '00:45:00',
        q1: { status: 'AC', time: '00:12:00', penalty: 1 },
        q2: { status: 'AC', time: '00:40:00', penalty: 0 },
        q3: { status: 'WA', time: null, penalty: 3 }, // 🐞 3 nhưng chưa AC
        q4: { status: null, time: null, penalty: 0 },
      },
      {
        id: 'user4',
        rank: 4,
        username: 'QuocHung',
        avatar: 'C',
        score: 3,
        finishTime: '00:20:00',
        q1: { status: 'AC', time: '00:20:00', penalty: 0 },
        q2: { status: null, time: null, penalty: 0 },
        q3: { status: null, time: null, penalty: 0 },
        q4: { status: null, time: null, penalty: 0 },
      }
    ];

    setTimeout(() => {
      setData(initialData);
      setLoading(false);
    }, 1000);

    // Giả lập realtime update sau 5 giây (HieuIT giải thêm bài, hoặc ai đó nộp sai)
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev];
        // Thay đổi nhỏ để thấy tính realtime
        if (newData[3].q2.status === null && Math.random() > 0.5) {
          newData[3] = {
            ...newData[3],
            score: 7,
            finishTime: '00:50:00',
            q2: { status: 'AC', time: '00:50:00', penalty: 1 }
          };
        }
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [contestId]);

  return { data, loading };
};

// Column Helper
const columnHelper = createColumnHelper();

const QuestionCell = ({ data }) => {
  if (!data || (data.status === null && data.penalty === 0)) {
    return <div className="h-8"></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-10">
      {data.status === 'AC' ? (
        <span className="font-mono text-sm font-bold text-gray-300">{data.time}</span>
      ) : (
        <span className="font-mono text-sm text-gray-600">-</span>
      )}

      {data.penalty > 0 && (
        <span className="text-xs font-bold text-red-500 mt-0.5">
          🐞 {data.penalty}
        </span>
      )}
    </div>
  );
};

export default function ContestRanking() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { data: rankingData, loading } = useLiveRanking(contestId);

  const columns = useMemo(() => [
    columnHelper.accessor('rank', {
      header: 'Rank',
      cell: (info) => {
        const rank = info.getValue();
        if (rank === 1) return <span className="text-2xl drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] text-yellow-400 font-black">1</span>;
        if (rank === 2) return <span className="text-2xl drop-shadow-[0_0_8px_rgba(156,163,175,0.5)] text-gray-300 font-bold">2</span>;
        if (rank === 3) return <span className="text-2xl drop-shadow-[0_0_8px_rgba(180,83,9,0.5)] text-amber-600 font-bold">3</span>;
        return <span className="text-gray-500 font-bold">{rank}</span>;
      },
    }),
    columnHelper.accessor('username', {
      header: 'Name',
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gray-300 font-bold text-xs flex-shrink-0">
            {info.row.original.avatar}
          </div>
          <span className="font-bold text-white text-sm">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('score', {
      header: 'Score',
      cell: (info) => <span className="text-cyan-400 font-bold text-base">{info.getValue()}</span>,
    }),
    columnHelper.accessor('finishTime', {
      header: 'Finish Time',
      cell: (info) => <span className="text-gray-400 font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('q1', {
      header: () => <div className="text-center"><span className="text-white font-bold">Q1</span><br /><span className="text-xs text-green-500 font-mono">3pt</span></div>,
      cell: (info) => <QuestionCell data={info.getValue()} />,
    }),
    columnHelper.accessor('q2', {
      header: () => <div className="text-center"><span className="text-white font-bold">Q2</span><br /><span className="text-xs text-blue-500 font-mono">4pt</span></div>,
      cell: (info) => <QuestionCell data={info.getValue()} />,
    }),
    columnHelper.accessor('q3', {
      header: () => <div className="text-center"><span className="text-white font-bold">Q3</span><br /><span className="text-xs text-orange-500 font-mono">5pt</span></div>,
      cell: (info) => <QuestionCell data={info.getValue()} />,
    }),
    columnHelper.accessor('q4', {
      header: () => <div className="text-center"><span className="text-white font-bold">Q4</span><br /><span className="text-xs text-red-500 font-mono">6pt</span></div>,
      cell: (info) => <QuestionCell data={info.getValue()} />,
    }),
  ], []);

  const table = useReactTable({
    data: rankingData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen font-sans bg-[#0a0a0a] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/contest/${contestId}`)}
            className="p-2 hover:bg-zinc-900 rounded-lg text-gray-500 transition-colors border border-transparent hover:border-zinc-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="text-yellow-500" size={24} /> Bảng Xếp Hạng Kỳ Thi
            </h1>
            <p className="text-gray-500 text-sm mt-1">Dữ liệu được cập nhật theo thời gian thực (Real-time)</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm thí sinh..."
              className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Đang tham gia: 42</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Hoàn thành: 12</span>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              Đang đồng bộ dữ liệu từ server...
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="bg-[#050505] border-b border-zinc-800">
                      {headerGroup.headers.map((header, i) => (
                        <th
                          key={header.id}
                          className={`px-6 py-4 text-xs uppercase tracking-widest ${i >= 4 ? 'text-center' : 'text-left'}`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${index % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-zinc-900/50'}`}
                    >
                      {row.getVisibleCells().map((cell, i) => (
                        <td key={cell.id} className={`px-6 py-3 ${i >= 4 ? 'text-center border-l border-zinc-800/30' : ''}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
