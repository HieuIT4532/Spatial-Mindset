import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Users, ChevronRight, Award, Swords, CheckCircle2 } from 'lucide-react';
import { useContestStore } from '../../stores/useContestStore';

export default function ContestList() {
  const navigate = useNavigate();
  const { contests, elo, registeredContests, registerContest, unregisterContest, getRank } = useContestStore();
  const rank = getRank();

  const handleAction = (contest) => {
    if (contest.status === 'ongoing') {
      navigate(`/contest/${contest.id}`);
    } else if (contest.status === 'upcoming') {
      if (registeredContests.includes(contest.id)) {
        unregisterContest(contest.id);
      } else {
        registerContest(contest.id);
      }
    } else {
      // past → view results (navigate anyway)
      navigate(`/contest/${contest.id}`);
    }
  };

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

          {/* Elo Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 mt-4">
            <span className="text-2xl">{rank.emoji}</span>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Elo Rating</p>
              <p className="text-xl font-black" style={{ color: rank.color }}>{elo} — {rank.name}</p>
            </div>
          </div>
        </div>

        {/* Contest List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2">
            <Trophy className="text-yellow-400" /> Giải đấu Nổi bật
          </h2>
          
          <div className="grid gap-4">
            {contests.map(contest => {
              const isRegistered = registeredContests.includes(contest.id);
              
              return (
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
                      {isRegistered && contest.status === 'upcoming' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={12} /> Đã đăng ký
                        </span>
                      )}
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
                      onClick={() => handleAction(contest)}
                      className={`w-full md:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2
                        ${contest.status === 'ongoing' 
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                          : contest.status === 'upcoming'
                          ? isRegistered 
                            ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      {contest.status === 'ongoing' ? 'Tham gia ngay' : 
                       contest.status === 'upcoming' ? (isRegistered ? 'Hủy đăng ký' : 'Đăng ký') : 
                       'Xem kết quả'}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
