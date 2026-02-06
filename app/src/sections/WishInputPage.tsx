import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Check, Sparkles, User, PenLine, RefreshCw } from 'lucide-react'
import type { WishItem, PresetName } from '@/types'

interface WishInputPageProps {
  wishes: WishItem[]
  setWishes: (wishes: WishItem[]) => void
  presetNames: PresetName[]
}

export function WishInputPage({ wishes, setWishes, presetNames }: WishInputPageProps) {
  const [selectedNameId, setSelectedNameId] = useState<string>('')
  const [wishText, setWishText] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedName, setSubmittedName] = useState('')

  // 获取已提交愿望的姓名列表
  const submittedNames = new Set(wishes.map(w => w.name))
  // 过滤出未提交愿望的预设姓名
  const availableNames = presetNames.filter(n => !submittedNames.has(n.name))

  const handleSubmit = () => {
    if (!selectedNameId) {
      toast.error('请选择您的姓名')
      return
    }
    
    const selectedName = presetNames.find(n => n.id === selectedNameId)?.name
    if (!selectedName) {
      toast.error('姓名选择无效')
      return
    }

    // 检查该姓名是否已提交过愿望
    const existingWish = wishes.find(w => w.name === selectedName)
    if (existingWish) {
      toast.error(`${selectedName} 已经提交过愿望了`)
      return
    }

    if (!wishText.trim()) {
      toast.error('请输入您的新年愿望')
      return
    }

    if (wishText.trim().length < 5) {
      toast.error('愿望内容太短了，多说几句吧~')
      return
    }

    if (wishText.trim().length > 100) {
      toast.error('愿望内容太长了，请控制在100字以内')
      return
    }

    const newWish: WishItem = {
      id: Date.now().toString(),
      name: selectedName,
      wish: wishText.trim(),
      createdAt: Date.now()
    }

    setWishes([...wishes, newWish])
    setSubmittedName(selectedName)
    setShowSuccess(true)
    toast.success('🎉 愿望提交成功！祝您心想事成！')
  }

  const handleReset = () => {
    setShowSuccess(false)
    setSelectedNameId('')
    setWishText('')
    setSubmittedName('')
  }

  // 提交成功页面
  if (showSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* 背景 */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/hero-horse.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* 内容 */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                愿望已提交
              </h2>
              <p className="text-gray-500 mb-6">
                {submittedName} 的新年愿望
              </p>
              
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-2">
                  <PenLine className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-left">{wishText}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  每人只能提交一次愿望
                </p>
                
                {/* 重新选择按钮 - 用于下一个人填写 */}
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  下一位填写
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 如果没有预设人员
  if (presetNames.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/hero-horse.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                暂未开放
              </h2>
              <p className="text-gray-500">
                管理员尚未添加人员名单，请稍后再试
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 如果所有人员都已提交
  if (availableNames.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/hero-horse.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                全部提交完成
              </h2>
              <p className="text-gray-500">
                所有 {presetNames.length} 位同事都已提交新年愿望
              </p>
              <p className="text-sm text-gray-400 mt-4">
                请前往抽奖页面开始抽取幸运愿望
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero-horse.jpg)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      {/* 飘落装饰 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              animation: `fall ${8 + Math.random() * 6}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {['🧧', '✨', '🎊', '🏮', '🐴'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      {/* 内容 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardContent className="p-6 md:p-8">
            {/* 标题 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                许下您的新年愿望
              </h1>
              <p className="text-gray-500">
                总编室"骏采星驰"新春活动
              </p>
              <p className="text-sm text-gray-400 mt-2">
                剩余 {availableNames.length} 人未提交
              </p>
            </div>

            {/* 姓名选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                请选择您的姓名
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {availableNames.map((name) => (
                  <button
                    key={name.id}
                    onClick={() => setSelectedNameId(name.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedNameId === name.id
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {name.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 愿望输入 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                您的新年愿望
              </label>
              <textarea
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                placeholder="写下您的新年愿望...（5-100字）"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none transition-all"
                rows={4}
                maxLength={100}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400">
                  提交后不可修改
                </span>
                <span className={`text-xs ${wishText.length > 90 ? 'text-red-500' : 'text-gray-400'}`}>
                  {wishText.length}/100
                </span>
              </div>
            </div>

            {/* 提交按钮 */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedNameId}
              className="w-full py-6 text-lg font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-500 hover:from-red-600 hover:via-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <Check className="w-5 h-5 mr-2" />
              提交愿望
            </Button>

            {/* 提示 */}
            <p className="text-center text-xs text-gray-400 mt-4">
              每人仅能提交一次愿望，请认真填写
            </p>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
