import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ArrowLeft, CheckCircle, Lightbulb, Play } from 'lucide-react';

import { fetchProblemById } from '../../api/problemsApi';
import App from '../../App'; // Import App components or 3D Canvas
import { Badge } from '../../components/ui/badge';

export default function ProblemWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Lấy chi tiết bài toán
  const { data: problem, isLoading } = useQuery({
    queryKey: ['problem', id],
    queryFn: () => fetchProblemById(id),
  });

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center font-sans dark:bg-[#0a0a0a] dark:text-white">Đang tải đề bài...</div>;
  }

  if (!problem) {
    return <div className="h-screen w-full flex items-center justify-center font-sans dark:bg-[#0a0a0a] dark:text-white">Không tìm thấy bài toán!</div>;
  }

  const handleResetCamera = () => {
    window.dispatchEvent(new CustomEvent('spatialmind-generate'));
    window.dispatchEvent(new CustomEvent('spatialmind-reset-view'));
  };

  return (
    <div className="h-screen w-full font-sans bg-white dark:bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Header bar nhỏ cho Workspace */}
      <div className="h-14 border-b border-gray-200 dark:border-zinc-800 flex items-center px-4 justify-between bg-gray-50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/problems')}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md text-gray-500 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-bold text-sm text-zinc-900 dark:text-white truncate max-w-[300px]">{problem.title}</span>
          <Badge variant="outline" className={
            problem.difficulty === 'Easy' ? 'text-green-500 border-green-500/20' :
            problem.difficulty === 'Medium' ? 'text-orange-500 border-orange-500/20' :
            'text-red-500 border-red-500/20'
          }>
            {problem.difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleResetCamera}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors shadow-sm"
          >
            <Play size={12} />
            Khởi Tạo / Reset
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm">
            <CheckCircle size={14} />
            Submit
          </button>
        </div>
      </div>

      {/* Split Panels */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel: Problem Statement */}
        <Panel defaultSize={35} minSize={20} maxSize={50}>
          <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-gray-300">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {problem.content}
              </ReactMarkdown>
            </div>

            {/* AI Hint Section */}
            <div className="mt-8 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
              <div className="flex items-center gap-2 text-cyan-500 font-bold mb-2">
                <Lightbulb size={16} />
                <span>AI Socratic Hint</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hãy thử vẽ đường cao của khối chóp trước khi tính thể tích. Bạn cần tôi gợi ý thêm về cách xác định chân đường cao không?
              </p>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1.5 bg-gray-200 dark:bg-zinc-800 hover:bg-cyan-500 transition-colors cursor-col-resize" />

        {/* Right Panel: 3D Workspace */}
        <Panel defaultSize={65}>
          <div className="h-full w-full relative">
            {/* Tái sử dụng component App (Canvas) nhưng ở mode rút gọn */}
            <App isWorkspaceMode={true} initialProblem={problem} />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
