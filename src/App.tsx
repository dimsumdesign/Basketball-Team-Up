import React, { useState, useRef } from 'react';
import { Player, Position, Team } from './types';
import { generateTeams } from './utils/grouping';
import { DEFAULT_PLAYERS } from './utils/constants';
import { Users, UserPlus, Trash2, Shuffle, Trophy, Settings, Star, Dribbble, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';

function getPositionColor(pos: string) {
  switch(pos) {
    case 'PG': return 'bg-blue-500/20 text-blue-400';
    case 'SG': return 'bg-purple-500/20 text-purple-400';
    case 'SF': return 'bg-red-500/20 text-red-400';
    case 'PF': return 'bg-green-500/20 text-green-400';
    case 'C': return 'bg-yellow-500/20 text-yellow-400';
    default: return 'bg-zinc-700 text-zinc-300';
  }
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamSize, setTeamSize] = useState<number>(5);
  
  const teamsRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState<Position>('ANY');
  const [newSkill, setNewSkill] = useState<number>(3);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newName.trim(),
      position: newPosition,
      skill: newSkill
    };
    
    setPlayers([...players, newPlayer]);
    setNewName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const loadDefaultPlayers = () => {
    setPlayers(DEFAULT_PLAYERS);
  };

  const handleGenerateTeams = () => {
    if (players.length === 0) return;
    const generated = generateTeams(players, teamSize);
    setTeams(generated);
  };

  const handleDownloadImage = async () => {
    if (!teamsRef.current) return;
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(teamsRef.current, {
        backgroundColor: '#09090b', // zinc-950 to match background
        scale: 2,
        useCORS: true,
        logging: false
      });
      const image = canvas.toDataURL('image/png');
      
      // Show preview modal as fallback for iframe restrictions
      setPreviewImage(image);
      
      // Attempt auto-download
      const link = document.createElement('a');
      link.href = image;
      link.download = `hoopsdraft-teams-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download image', error);
      alert('生成图片失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dribbble className="w-8 h-8 text-orange-500" />
            <h1 className="text-xl font-bold tracking-tight">HoopsDraft <span className="text-zinc-500 font-normal">| 篮球公平分组</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Users className="w-4 h-4" />
              <span>{players.length} 球员</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Player Management */}
        <div className="lg:col-span-4 space-y-6">
          {/* Add Player Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-500" />
              添加球员
            </h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">姓名</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="输入球员姓名..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">位置</label>
                  <select 
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value as Position)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  >
                    <option value="ANY">任意 (ANY)</option>
                    <option value="PG">控卫 (PG)</option>
                    <option value="SG">分卫 (SG)</option>
                    <option value="SF">小前 (SF)</option>
                    <option value="PF">大前 (PF)</option>
                    <option value="C">中锋 (C)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">能力值 (1-5)</label>
                  <select 
                    value={newSkill}
                    onChange={(e) => setNewSkill(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} 星</option>)}
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                添加
              </button>
            </form>
          </div>

          {/* Player List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                球员名单
              </h2>
              {players.length === 0 && (
                <button 
                  onClick={loadDefaultPlayers}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition-colors"
                >
                  加载20人测试数据
                </button>
              )}
              {players.length > 0 && (
                <button 
                  onClick={() => setPlayers([])}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  清空
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              <AnimatePresence>
                {players.map(player => (
                  <motion.div 
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between bg-zinc-950 border border-zinc-800/50 p-3 rounded-xl group hover:border-zinc-700 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">{player.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {player.position}
                        </span>
                        <div className="flex items-center">
                          {Array.from({length: player.skill}).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-orange-500 fill-orange-500" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removePlayer(player.id)}
                      className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {players.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
                  <Users className="w-8 h-8 opacity-20" />
                  <p className="text-sm">暂无球员</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Results */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-medium">每组人数:</span>
              </div>
              <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-800 p-1">
                {[3, 4, 5].map(size => (
                  <button
                    key={size}
                    onClick={() => setTeamSize(size)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${teamSize === size ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    {size}人
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleGenerateTeams}
              disabled={players.length === 0}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <Shuffle className="w-5 h-5" />
              随机公平分组
            </button>
          </div>

          {/* Teams Display */}
          {teams.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? '生成中...' : '保存为图片'}
                </button>
              </div>
              <div ref={teamsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-950 -m-4 rounded-xl">
                {teams.map((team, idx) => (
                <motion.div 
                  key={team.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl"
                >
                  <div className="bg-zinc-950/50 p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      {team.name}
                    </h3>
                    <div className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">
                      总战力: {team.totalSkill}
                    </div>
                  </div>
                  <div className="p-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-zinc-500 border-b border-zinc-800/50">
                          <th className="text-left font-medium py-2 px-3">分配位置</th>
                          <th className="text-left font-medium py-2 px-3">球员</th>
                          <th className="text-right font-medium py-2 px-3">能力</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.players.map((player, pIdx) => (
                          <tr key={pIdx} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold ${getPositionColor(player.assignedPosition || player.position)}`}>
                                {player.assignedPosition || player.position}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-medium">{player.name}</td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end">
                                {Array.from({length: player.skill}).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-orange-500 fill-orange-500" />
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-zinc-500">
              <Dribbble className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-zinc-400">尚未分组</p>
              <p className="text-sm mt-1">添加球员并点击"随机公平分组"开始</p>
            </div>
          )}
        </div>
      </main>

      {/* Image Preview Modal for Iframe Fallback */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Download className="w-5 h-5 text-orange-500" />
                  保存分组结果
                </h3>
                <button 
                  onClick={() => setPreviewImage(null)} 
                  className="text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-lg transition-colors text-sm"
                >
                  关闭
                </button>
              </div>
              <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 mb-4 flex justify-center">
                <img src={previewImage} alt="分组结果" className="max-w-full h-auto object-contain" />
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                <p className="text-sm text-orange-200">
                  如果未自动下载，请<strong className="text-orange-400 font-bold mx-1">长按图片</strong>或<strong className="text-orange-400 font-bold mx-1">右键点击图片</strong>选择“另存为”或“保存到相册”。
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
