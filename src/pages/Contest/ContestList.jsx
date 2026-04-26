import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Users, ChevronRight, Award, Swords } from 'lucide-react';

const MOCK_CONTESTS = [
  {
    id: 1,
    title: 'Weekly Geometry Challenge #104',
    status: 'ongoing',
    startTime: 'Đang diễn ra',
    participants: 1245,
    duration: '90 phút',
    prizes: ['Huy hiệu Weekly Winner', '500 XP']
  },
  {
    id: 2,
    title: 'Monthly Spatial Cup - May 2026',
    status: 'upcoming',
    startTime: 'Bắt đầu sau 3 ngày',
    participants: 450,
    duration: '120 phút',
    prizes: ['Premium 1 tháng', 'Khung Avatar Đặc biệt']
  },
  {
    id: 3,
    title: 'Vector Masterclass Arena',
    status: 'past',
    startTime: 'Đã kết thúc',
    participants: 3200,
    duration: '60 phút',
    prizes: []
  }
];

export default function ContestList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 px-8 pb-12 bg-[#020617] text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 rounded-3xl mb-2">
            <Swords size={48} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase">
            Đấu Trường <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Không Gian</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Cạnh tranh với hàng ngàn học sinh khác để giành lấy vị trí top đầu bảng xếp hạng. 
            Nâng cao Elo, nhận huy hiệu độc quyền và khẳng định tư duy hình học của bạn!
          </p>
        </div>

        {/* Current / Upcoming Contests */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2">
            <Trophy className="text-yellow-400" /> Giải đấu Nổi bật
          </h2>
          
          <div className="grid gap-4">
            {MOCK_CONTESTS.map(contest => (
              <div 
                key={contest.id}
                className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-white/10 hover:border-cyan-500/50 transition-all p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Background glow if ongoing */}
                {contest.status === 'ongoing' && (
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full" />
                )}

                <div className="space-y-2 z-10">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider
                      ${contest.status === 'ongoing' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 
                        contest.status === 'upcoming' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 
                        'bg-slate-800 text-slate-400'}`}
                    >
                      {contest.status === 'ongoing' ? 'Live Now' : contest.status === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {contest.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {contest.startTime} ({contest.duration})</span>
                    <span className="flex items-center gap-1.5"><Users size={14} /> {contest.participants} tham gia</span>
                  </div>
                  
                  {contest.prizes.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      <Award size={14} className="text-yellow-400" />
                      <span className="text-xs text-yellow-400/80 font-medium">
                        Phần thưởng: {contest.prizes.join(' • ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="z-10 w-full md:w-auto">
                  <button 
                    onClick={() => navigate(`/contest/${contest.id}`)}
                    disabled={contest.status === 'past'}
                    className={`w-full md:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2
                      ${contest.status === 'ongoing' 
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                        : contest.status === 'upcoming'
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                  >
                    {contest.status === 'ongoing' ? 'Tham gia ngay' : contest.status === 'upcoming' ? 'Đăng ký' : 'Xem kết quả'}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
