import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Settings, Play, Square } from 'lucide-react'
import { toast } from 'sonner'
import type { WishItem, PageView } from '@/types'

interface LotteryPageProps {
  wishes: WishItem[]
  onNavigate: (page: PageView) => void
}

// 烟花效果
function Fireworks({ show }: { show: boolean }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([])
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#FF1493']

  useEffect(() => {
    if (show) {
      const newParticles = []
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      for (let i = 0; i < 80; i++) {
        newParticles.push({
          id: i,
          x: centerX + (Math.random() - 0.5) * 300,
          y: centerY + (Math.random() - 0.5) * 300,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 400
        })
      }
      setParticles(newParticles)
      
      setTimeout(() => setParticles([]), 2500)
    }
  }, [show])

  if (!show || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="firework-particle"
          style={{
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
            '--tx': `${(Math.random() - 0.5) * 300}px`,
            '--ty': `${(Math.random() - 0.5) * 300}px`,
            animationDelay: `${p.delay}ms`
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// 飘落装饰
function FallingDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl md:text-3xl"
          style={{
            left: `${Math.random() * 100}%`,
            animation: `fall ${10 + Math.random() * 8}s linear infinite`,
            animationDelay: `${Math.random() * 8}s`,
            opacity: 0.5
          }}
        >
          {['🧧', '✨', '🎊', '🏮', '🐴', '🌟', '💫'][Math.floor(Math.random() * 7)]}
        </div>
      ))}
    </div>
  )
}

export function LotteryPage({ wishes, onNavigate }: LotteryPageProps) {
  const [isRolling, setIsRolling] = useState(false)
  const [selectedWish, setSelectedWish] = useState<WishItem | null>(null)
  const [displayWish, setDisplayWish] = useState<WishItem | null>(null)
  const [showFireworks, setShowFireworks] = useState(false)
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 抽奖逻辑
  const startRoll = useCallback(() => {
    if (wishes.length < 2) {
      toast.error('愿望数量不足，请返回后台添加更多')
      return
    }
    
    setIsRolling(true)
    setSelectedWish(null)
    setShowFireworks(false)
    
    rollIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * wishes.length)
      setDisplayWish(wishes[randomIndex])
    }, 50)
  }, [wishes])

  const stopRoll = useCallback(() => {
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current)
      rollIntervalRef.current = null
    }
    
    const randomIndex = Math.floor(Math.random() * wishes.length)
    const finalWish = wishes[randomIndex]
    
    setDisplayWish(finalWish)
    setSelectedWish(finalWish)
    setIsRolling(false)
    setShowFireworks(true)
    
    toast.success(`🎉 恭喜 ${finalWish.name}！愿望被抽中！`, {
      duration: 4000,
      icon: '🐴'
    })
  }, [wishes])

  const toggleRoll = () => {
    if (isRolling) {
      stopRoll()
    } else {
      startRoll()
    }
  }

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        toggleRoll()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleRoll])

  // 清理
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 主视觉背景 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero-horse.jpg)' }}
      />
      
      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />

      {/* 烟花效果 */}
      <Fireworks show={showFireworks} />
      
      {/* 飘落装饰 */}
      <FallingDecorations />

      {/* 顶部导航 */}
      <div className="relative z-30 flex justify-between items-center p-4">
        <Button
          variant="ghost"
          onClick={() => onNavigate('admin')}
          className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur"
        >
          <Settings className="w-5 h-5 mr-2" />
          后台管理
        </Button>
        <div className="text-white/80 text-sm backdrop-blur bg-black/20 px-3 py-1 rounded-full">
          共 {wishes.length} 个愿望
        </div>
      </div>

      {/* 主内容区 */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 pb-20">
        {/* 抽奖显示区 */}
        <div className="w-full max-w-2xl">
          {displayWish ? (
            <div className={`text-center transition-all duration-75 ${isRolling ? 'scale-105' : 'scale-100'}`}>
              {/* 姓名 */}
              <div className={`mb-4 ${isRolling ? 'animate-pulse' : ''}`}>
                <p className="text-white/80 text-lg mb-2 drop-shadow-lg">恭喜</p>
                <div className={`text-5xl md:text-7xl lg:text-8xl font-black drop-shadow-2xl ${
                  isRolling 
                    ? 'text-white/70 blur-[2px]' 
                    : selectedWish 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 winner-glow'
                      : 'text-white'
                }`}>
                  {displayWish.name}
                </div>
              </div>

              {/* 愿望卡片 */}
              <div className={`relative mx-auto max-w-xl px-8 py-8 rounded-2xl backdrop-blur-md ${
                isRolling 
                  ? 'bg-white/20' 
                  : selectedWish
                    ? 'bg-gradient-to-r from-red-600/90 to-orange-600/90 blessing-glow'
                    : 'bg-white/30'
              }`}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl">🧧</div>
                
                <p className={`text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed ${
                  isRolling ? 'text-white/60' : 'text-white'
                }`}>
                  {isRolling ? '...' : displayWish.wish}
                </p>
                
                {!isRolling && selectedWish && (
                  <div className="flex justify-center gap-3 mt-6">
                    <span className="text-3xl animate-bounce" style={{ animationDelay: '0s' }}>🎊</span>
                    <span className="text-3xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎉</span>
                    <span className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
                    <span className="text-3xl animate-bounce" style={{ animationDelay: '0.3s' }}>🐴</span>
                    <span className="text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎊</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="relative inline-block mb-8">
                <span className="text-8xl md:text-9xl drop-shadow-2xl">🧧</span>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping" />
              </div>
              <p className="text-2xl md:text-3xl text-white font-bold drop-shadow-lg mb-2">
                点击开始抽奖
              </p>
              <p className="text-white/70 text-lg drop-shadow">
                随机抽取幸运新年愿望
              </p>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="mt-12">
          <Button
            onClick={toggleRoll}
            disabled={wishes.length < 2}
            className={`px-14 md:px-20 py-8 md:py-10 text-2xl md:text-3xl font-black rounded-full transition-all transform hover:scale-105 shadow-2xl ${
              isRolling
                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white animate-pulse'
                : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 hover:from-yellow-300 hover:via-orange-300 hover:to-red-400 text-red-900'
            }`}
          >
            {isRolling ? (
              <>
                <Square className="w-8 h-8 mr-3 fill-current" />
                停止
              </>
            ) : (
              <>
                <Play className="w-8 h-8 mr-3 fill-current" />
                开始抽奖
              </>
            )}
          </Button>
        </div>

        {/* 提示 */}
        <div className="mt-8 text-center">
          {wishes.length < 2 ? (
            <p className="text-yellow-200 text-sm md:text-base drop-shadow">
              请返回后台添加至少 2 条愿望
            </p>
          ) : (
            <p className="text-white/60 text-sm drop-shadow">
              按 <kbd className="px-2 py-1 bg-white/20 rounded text-white">空格键</kbd> 快速{isRolling ? '停止' : '开始'}
            </p>
          )}
        </div>
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes fireworkExplode {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        .firework-particle {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          animation: fireworkExplode 1.2s ease-out forwards;
        }

        @keyframes winnerGlow {
          0%, 100% {
            text-shadow: 0 0 30px rgba(253, 224, 71, 0.8),
                         0 0 60px rgba(253, 224, 71, 0.5),
                         0 0 90px rgba(253, 224, 71, 0.3);
          }
          50% {
            text-shadow: 0 0 50px rgba(253, 224, 71, 1),
                         0 0 100px rgba(253, 224, 71, 0.7),
                         0 0 150px rgba(253, 224, 71, 0.5);
          }
        }

        .winner-glow {
          animation: winnerGlow 2s ease-in-out infinite;
        }

        @keyframes blessingGlow {
          0%, 100% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.6),
                        0 0 60px rgba(251, 146, 60, 0.4),
                        0 0 90px rgba(234, 179, 8, 0.3);
          }
          50% {
            box-shadow: 0 0 50px rgba(239, 68, 68, 0.8),
                        0 0 100px rgba(251, 146, 60, 0.6),
                        0 0 150px rgba(234, 179, 8, 0.5);
          }
        }

        .blessing-glow {
          animation: blessingGlow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
