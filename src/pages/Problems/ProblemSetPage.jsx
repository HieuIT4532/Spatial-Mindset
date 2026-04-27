import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  flexRender, 
  getCoreRowModel, 
  getSortedRowModel, 
  getFilteredRowModel, 
  useReactTable 
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, Clock, Crown, ArrowUpDown } from 'lucide-react';

import { fetchProblems, fetchUserProgress } from '../../api/problemsApi';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select';
import { useAuth } from '../../contexts/AuthContext';

// Hook cho Debounce Input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const TOPIC_TAGS = ['Khoảng cách', 'Góc', 'Thể tích', 'Thiết diện', 'Đồ thị hoá', 'Khối tròn xoay', 'Min-Max Hình học'];

export default function ProblemSetPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [globalFilter, setGlobalFilter] = useState('');
  const debouncedSearch = useDebounce(globalFilter, 300);
  
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch problems
  const { data: problems, isLoading: isProblemsLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: fetchProblems,
  });

  // Fetch user progress
  const { data: progress, isLoading: isProgressLoading } = useQuery({
    queryKey: ['userProgress', user?.uid],
    queryFn: () => fetchUserProgress(user?.uid),
    enabled: !!user, // Chỉ gọi khi user đã đăng nhập
  });

  // Merge data
  const data = useMemo(() => {
    if (!problems) return [];
    
    return problems.map(problem => {
      let status = null;
      if (progress?.solvedProblems?.includes(problem.id)) {
        status = 'solved';
      } else if (progress?.attemptedProblems?.includes(problem.id)) {
        status = 'attempted';
      }

      return {
        ...problem,
        status
      };
    }).filter(p => {
      // Manual filtering for dropdowns because react-table globalFilter is text based
      if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) return false;
      if (statusFilter !== 'All') {
        if (statusFilter === 'Solved' && p.status !== 'solved') return false;
        if (statusFilter === 'Attempted' && p.status !== 'attempted') return false;
        if (statusFilter === 'Todo' && p.status !== null) return false;
      }
      return true;
    });
  }, [problems, progress, difficultyFilter, statusFilter]);

  // Table Columns
  const columns = useMemo(() => [
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const s = row.getValue('status');
        if (s === 'solved') return <CheckCircle2 className="text-green-500 w-5 h-5 mx-auto" />;
        if (s === 'attempted') return <Clock className="text-yellow-500 w-5 h-5 mx-auto" />;
        return <div className="w-5 h-5 mx-auto" />; // Empty placeholder
      },
      enableSorting: false,
    },
    {
      accessorKey: 'title',
      header: 'Tiêu đề',
      cell: ({ row }) => {
        const isPremium = row.original.isPremium;
        return (
          <div className="flex items-center gap-2">
            <span 
              onClick={() => navigate(`/problems/${row.original.id}`)}
              className="font-medium hover:underline cursor-pointer text-slate-800 dark:text-slate-200"
            >
              {row.getValue('title')}
            </span>
            {isPremium && <Crown size={14} className="text-amber-500" />}
          </div>
        );
      },
    },
    {
      accessorKey: 'acceptanceRate',
      header: ({ column }) => {
        return (
          <div 
            className="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tỷ lệ Accept
            <ArrowUpDown size={14} />
          </div>
        );
      },
      cell: ({ row }) => `${row.getValue('acceptanceRate')}%`,
    },
    {
      accessorKey: 'difficulty',
      header: 'Độ khó',
      cell: ({ row }) => {
        const diff = row.getValue('difficulty');
        let colorClass = '';
        if (diff === 'Easy') colorClass = 'text-green-500 bg-green-500/10 border-green-500/20';
        if (diff === 'Medium') colorClass = 'text-orange-500 bg-orange-500/10 border-orange-500/20';
        if (diff === 'Hard') colorClass = 'text-red-500 bg-red-500/10 border-red-500/20';
        
        return (
          <Badge variant="outline" className={colorClass}>
            {diff}
          </Badge>
        );
      },
    },
  ], [navigate]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: debouncedSearch,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-20 px-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">Kho bài tập</h1>
          <p className="text-slate-500 dark:text-slate-400">Rèn luyện tư duy không gian với hàng ngàn bài toán từ cơ bản đến nâng cao.</p>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm bài tập..." 
              className="pl-9"
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Độ khó: Tất cả</SelectItem>
                <SelectItem value="Easy">Dễ (Easy)</SelectItem>
                <SelectItem value="Medium">Trung bình (Medium)</SelectItem>
                <SelectItem value="Hard">Khó (Hard)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Trạng thái: Tất cả</SelectItem>
                <SelectItem value="Solved">Đã giải (Solved)</SelectItem>
                <SelectItem value="Attempted">Đang thử (Attempted)</SelectItem>
                <SelectItem value="Todo">Chưa giải (Todo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Topic Tags */}
        <div className="flex flex-wrap gap-2">
          {TOPIC_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setGlobalFilter(tag)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          {(isProblemsLoading || isProgressLoading) ? (
            <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-zinc-900/30 text-slate-500 border-b border-slate-200 dark:border-zinc-800">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="px-4 py-3 font-semibold whitespace-nowrap">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map(row => (
                      <tr 
                        key={row.id} 
                        className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                        Không tìm thấy bài tập nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
