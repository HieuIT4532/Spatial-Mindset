import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getPaginationRowModel,
  flexRender 
} from '@tanstack/react-table';
import { CheckCircle2, Circle, ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';

const MOCK_PROBLEMS = [
  { id: 1, title: 'Tính thể tích khối chóp S.ABCD', acceptance: 68.5, difficulty: 'Easy', status: 'solved', topic: 'Hình chóp' },
  { id: 2, title: 'Góc giữa hai mặt phẳng (SAB) và (SCD)', acceptance: 45.2, difficulty: 'Medium', status: 'unsolved', topic: 'Góc' },
  { id: 3, title: 'Khoảng cách chéo nhau giữa hai đường thẳng', acceptance: 22.8, difficulty: 'Hard', status: 'unsolved', topic: 'Khoảng cách' },
  { id: 4, title: 'Thể tích khối lăng trụ tam giác đều', acceptance: 75.1, difficulty: 'Easy', status: 'solved', topic: 'Lăng trụ' },
  { id: 5, title: 'Mặt cầu ngoại tiếp hình chóp', acceptance: 35.4, difficulty: 'Medium', status: 'unsolved', topic: 'Mặt cầu' },
  { id: 6, title: 'Thiết diện cắt bởi mặt phẳng (P)', acceptance: 18.9, difficulty: 'Hard', status: 'unsolved', topic: 'Thiết diện' },
];

export default function ProblemsList() {
  const navigate = useNavigate();
  const [data] = useState(MOCK_PROBLEMS);
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: info => info.getValue() === 'solved' 
        ? <CheckCircle2 size={18} className="text-emerald-400 mx-auto" /> 
        : <Circle size={18} className="text-slate-600 mx-auto" />,
      size: 80,
    },
    {
      accessorKey: 'title',
      header: 'Tiêu đề bài toán',
      cell: info => (
        <span 
          className="font-bold text-slate-200 hover:text-cyan-400 cursor-pointer transition-colors"
          onClick={() => navigate(`/problems/${info.row.original.id}`)}
        >
          {info.row.original.id}. {info.getValue()}
        </span>
      ),
      size: 400,
    },
    {
      accessorKey: 'topic',
      header: 'Chủ đề',
      cell: info => (
        <span className="px-2 py-1 rounded-md bg-slate-800/50 text-slate-300 text-xs border border-white/5">
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'acceptance',
      header: 'Tỷ lệ Accept',
      cell: info => <span className="text-slate-400">{info.getValue()}%</span>,
    },
    {
      accessorKey: 'difficulty',
      header: 'Độ khó',
      cell: info => {
        const val = info.getValue();
        let colorClass = 'text-emerald-400';
        if (val === 'Medium') colorClass = 'text-yellow-400';
        if (val === 'Hard') colorClass = 'text-rose-400';
        return <span className={`font-black uppercase tracking-wider text-[10px] ${colorClass}`}>{val}</span>;
      },
    },
  ], [navigate]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="min-h-screen pt-24 px-8 pb-12 bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Kho Bài Tập <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">Hệ Thống Mới</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm">Chinh phục hình học không gian với SpatialMind Judge System.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Tìm kiếm bài toán..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-sm hover:bg-white/5 transition-colors">
              <Filter size={16} className="text-slate-400" /> Lọc
            </button>
          </div>
        </div>

        {/* The Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-900/30 backdrop-blur-xl shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 border-b border-white/5 uppercase text-[10px] tracking-widest text-slate-500 font-black">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="px-6 py-4 cursor-pointer hover:text-slate-300 transition-colors select-none"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : 'auto' }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className={`flex items-center gap-2 ${header.column.id === 'status' ? 'justify-center' : ''}`}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUp size={14} className="text-cyan-400" />,
                          desc: <ChevronDown size={14} className="text-cyan-400" />,
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/5">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-slate-400">
            <span>Hiển thị 1 - {table.getRowModel().rows.length} của {data.length} bài toán</span>
            <div className="flex gap-2">
              <button 
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Trang trước
              </button>
              <button 
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Trang tiếp
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
