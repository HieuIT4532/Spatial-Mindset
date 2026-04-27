// =====================================================
// SpatialMind — Problem List (Table)
// =====================================================

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ArrowUpDown, Play, Search, BrainCircuit } from 'lucide-react';
import useSettingsStore from '../../stores/useSettingsStore';

// Mock Data
const MOCK_PROBLEMS = [
  { id: 1, status: 'solved', title: 'Tính thể tích khối chóp S.ABCD', acceptance: 68, difficulty: 'Dễ', topic: 'Hình chóp' },
  { id: 2, status: 'todo', title: 'Khoảng cách giữa hai đường chéo nhau', acceptance: 42, difficulty: 'Trung bình', topic: 'Khoảng cách' },
  { id: 3, status: 'todo', title: 'Góc giữa mặt bên và mặt đáy', acceptance: 55, difficulty: 'Trung bình', topic: 'Góc' },
  { id: 4, status: 'solved', title: 'Bán kính mặt cầu ngoại tiếp lăng trụ', acceptance: 31, difficulty: 'Khó', topic: 'Mặt cầu' },
  { id: 5, status: 'todo', title: 'Thiết diện của hình hộp chữ nhật', acceptance: 48, difficulty: 'Trung bình', topic: 'Thiết diện' },
  { id: 6, status: 'todo', title: 'Thể tích khối chóp tứ giác đều', acceptance: 75, difficulty: 'Dễ', topic: 'Hình chóp' },
  { id: 7, status: 'todo', title: 'Tỉ số thể tích hai khối đa diện', acceptance: 25, difficulty: 'Khó', topic: 'Tỉ số thể tích' },
];

const DIFFICULTY_COLORS = {
  'Dễ': '#10b981', // emerald-500
  'Trung bình': '#f59e0b', // amber-500
  'Khó': '#ef4444', // red-500
};

export default function ProblemList({ onSelectProblem }) {
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';
  const [data] = useState(MOCK_PROBLEMS);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = [
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const val = row.getValue('status');
        return val === 'solved' ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <Circle size={18} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
        );
      },
      size: 80,
    },
    {
      accessorKey: 'title',
      header: 'Tiêu đề',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {row.getValue('title')}
          </span>
          <span className={`text-[10px] uppercase font-bold mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {row.original.topic}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'acceptance',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
        >
          Tỷ lệ Accept <ArrowUpDown size={12} />
        </button>
      ),
      cell: ({ row }) => (
        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          {row.getValue('acceptance')}%
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'difficulty',
      header: 'Độ khó',
      cell: ({ row }) => {
        const diff = row.getValue('difficulty');
        const color = DIFFICULTY_COLORS[diff];
        return (
          <span className="text-xs font-bold" style={{ color }}>
            {diff}
          </span>
        );
      },
      size: 120,
    },
    {
      id: 'action',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => onSelectProblem(row.original)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            isDark
              ? 'bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400'
              : 'bg-black/5 hover:bg-cyan-500/10 text-slate-700 hover:text-cyan-600'
          }`}
        >
          <Play size={12} /> Giải
        </button>
      ),
      size: 100,
    },
  ];

  const table = useReactTable({
    data: data.filter((d) => d.title.toLowerCase().includes(globalFilter.toLowerCase())),
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="h-full w-full max-w-6xl mx-auto px-6 py-8 flex flex-col">
      {/* Header & Controls */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-black mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <BrainCircuit className="text-cyan-400" size={32} />
            Kho Bài Tập
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Luyện tập tư duy không gian với hàng trăm bài toán từ cơ bản đến nâng cao.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Tìm kiếm bài toán..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
              isDark
                ? 'bg-white/5 border border-white/10 text-white placeholder-slate-500'
                : 'bg-black/5 border border-black/10 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="flex-1 overflow-auto rounded-2xl border"
        style={{
          background: isDark ? 'rgba(2,6,23,0.6)' : 'rgba(255,255,255,0.6)',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className={isDark ? 'border-b border-white/5' : 'border-b border-black/5'}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.column.getSize() }}
                    className={`p-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <motion.tr
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={row.id}
                className={`transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                  isDark ? 'border-b border-white/5' : 'border-b border-black/5'
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-500">
                  Không tìm thấy bài toán nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
