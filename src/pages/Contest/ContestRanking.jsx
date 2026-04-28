import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowLeft, Trophy, Search, User, Bug, Clock } from 'lucide-react';

// Custom Hook for Live Ranking (Firebase Mock)
const useLiveRanking = (contestId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập onSnapshot của Firestore lắng nghe collection contest_participations
    const initialData = [
      {
        id: '1',
        rank: 1,
        username: 'HieuIT',
        avatar: 'H',
        score: 18,
        finishTime: '01:12:45',
        q1: { time: '00:05:12', penalty: 0 },
        q2: { time: '00:15:30', penalty: 1 },
        q3: { time: '00:32:10', penalty: 0 },
        q4: { time: '01:07:45', penalty: 0 },
      },
      {
        id: '2',
        rank: 2,
        username: 'AliceSpace',
        avatar: 'A',
        score: 12,
        finishTime: '01:25:10',
        q1: { time: '00:10:05', penalty: 0 },
        q2: { time: '00:25:40', penalty: 0 },
        q3: { time: '00:55:10', penalty: 2 },
        q4: { time: null, penalty: 0 },
      },
      {
        id: '3',
        rank: 3,
        username: 'BobBuilder',
        avatar: 'B',
        score: 7,
        finishTime: '00:45:00',
        q1: { time: '00:12:00', penalty: 1 },
        q2: { time: '00:40:00', penalty: 0 },
        q3: { time: null, penalty: 3 },
        q4: { time: null, penalty: 0 },
      },
      {
        id: '4',
        rank: 4,
        username: 'Charlie3D',
        avatar: 'C',
        score: 3,
        finishTime: '00:20:00',
        q1: { time: '00:20:00', penalty: 0 },
        q2: { time: null, penalty: 1 },
        q3: { time: null, penalty: 0 },
        q4: { time: null, penalty: 0 },
      }
    ];

    const timer = setTimeout(() => {
      setData(initialData);
      setLoading(false);
    }, 1000);

    // Giả lập cập nhật realtime khi có người nộp bài
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev];
        // Giả lập Charlie3D giải được Q2 sau 5s
        if (newData[3] && !newData[3].q2.time) {
          newData[3] = {
            ...newData[3],
            score: 7,
            finishTime: '00:45:15',
            q2: { time: '00:45:15', penalty: 1 }
          };
        }
        return newData;
      });
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [contestId]);

  return { data, loading };
};

const columnHelper = createColumnHelper();

const QuestionCell = ({ data, points }) => {
  if (!data || (!data.time && data.penalty === 0)) return null;
  
  return (
    <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg">
      {data.time ? (
        <span className="text-sm font-bold text-gray-200 font-mono">{data.time}</span>
      ) : (
        <span className="text-sm font-bold text-gray-700 font-mono">--:--</span>
      )}
      {data.penalty > 0 && (
        <span className="flex items-center gap-1 text-[10px] font-black text-red-500 mt-0.5">
          <Bug size={10} /> {data.penalty}
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
      header: 'Hạng',
      cell: (info) => {
        const rank = info.getValue();
        if (rank === 1) return <span className="text-2xl drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">🥇</span>;
        if (rank === 2) return <span className="text-2xl drop-shadow-[0_0_8px_rgba(156,163,175,0.5)]">🥈</span>;
        if (rank === 3) return <span className="text-2xl drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]">🥉</span>;
        return <span className="text-gray-500 font-bold ml-2">{rank}</span>;
      },
    }),
    columnHelper.accessor('username', {
      header: 'Tên Học Sinh',
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-xs flex-shrink-0">
            {info.row.original.avatar || <User size={14} />}
          </div>
          <span className="font-bold text-white text-sm">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('score', {
      header: 'Điểm',
      cell: (info) => <span className="text-cyan-400 font-bold text-base">{info.getValue()}</span>,
    }),
    columnHelper.accessor('finishTime', {
      header: 'Thời Gian',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="text-gray-300 font-mono text-sm">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('q1', {
      header: () => <div className="text-center font-mono text-xs"><p className="text-gray-400">Q1</p><p className="text-green-500">(3)</p></div>,
      cell: (info) => <QuestionCell data={info.getValue()} />,
    }),
    columnHelper.accessor('q2', {
      header: () => <div className="text-center font-mono text-xs"><p className="text-gray-400">Q2</p><p className="text-blue-500">(4)</p></div>,
      cell: (info) => <QuestionCell data={info.getValue()} />,
    }),
    columnHelper.accessor('q3', {
      header: () => <div className="text-center font-mono text-xs"><p className="text-gray-400">Q3</p><p className="text-orange-500">(5)</p></div>,
      cell: (info) => <QuestionCell data={info.getValue()} />,
    }),
    columnHelper.accessor('q4', {
      header: () => <div className="text-center font-mono text-xs"><p className="text-gray-400">Q4</p><p className="text-red-500">(6)</p></div>,
      cell: (info) => <QuestionCell data={info.getValue()} />,
    }),
  ], []);

  const table = useReactTable({
    data: rankingData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen font-sans bg-[#0a0a0a] text-gray-300 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/contest/${contestId}`)}
            className="p-2 hover:bg-zinc-900 rounded-lg text-gray-500 transition-colors border border-transparent hover:border-zinc-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <Trophy className="text-yellow-500" size={24} /> Contest Leaderboard
            </h1>
            <p className="text-zinc-500 text-xs font-mono mt-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> REAL-TIME FEED ACTIVE
            </p>
          </div>
        </div>

        {/* Filters/Search */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Search participants..." 
              className="w-full bg-black/40 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-black/20 px-4 py-2 rounded-xl border border-zinc-800/50">
             <div className="flex items-center gap-2"><Clock size={12}/> Time Elapsed: 00:45:12</div>
          </div>
        </div>

        {/* Ranking Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-zinc-500 animate-pulse">SYNCING RANKING DATA...</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="bg-black/40 border-b border-zinc-800">
                      {headerGroup.headers.map((header, i) => (
                        <th 
                          key={header.id} 
                          className={`px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ${i >= 4 ? 'text-center' : 'text-left'}`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr 
                      key={row.id} 
                      className={`hover:bg-zinc-800/20 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-black/10'}`}
                    >
                      {row.getVisibleCells().map((cell, i) => (
                        <td key={cell.id} className={`px-6 py-4 ${i >= 4 ? 'text-center border-l border-zinc-800/20' : ''}`}>
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
        
        {/* Footer info */}
        <div className="p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl flex items-center gap-3">
          <Bug className="text-red-500" size={16} />
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            <strong>Penalty Rule:</strong> Every wrong submission adds 5 minutes to your total finish time. The total finish time is used to break ties between users with the same score.
          </p>
        </div>

      </div>
    </div>
  );
}
