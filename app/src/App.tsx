import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { AdminPage } from '@/sections/AdminPage'
import { LotteryPage } from '@/sections/LotteryPage'
import { WishInputPage } from '@/sections/WishInputPage'
import type { WishItem, PresetName, PageView } from '@/types'
import './App.css'

function App() {
  // 从URL hash获取当前页面
  const getPageFromHash = (): PageView => {
    const hash = window.location.hash.replace('#/', '')
    if (hash === 'wish-input') return 'wish-input'
    if (hash === 'lottery') return 'lottery'
    return 'admin'
  }

  const [currentPage, setCurrentPage] = useState<PageView>(getPageFromHash())
  
  // 预设人员名单
  const [presetNames, setPresetNames] = useState<PresetName[]>(() => {
    const saved = localStorage.getItem('preset-names')
    return saved ? JSON.parse(saved) : []
  })
  
  // 愿望列表
  const [wishes, setWishes] = useState<WishItem[]>(() => {
    const saved = localStorage.getItem('wishes')
    return saved ? JSON.parse(saved) : []
  })

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem('preset-names', JSON.stringify(presetNames))
  }, [presetNames])

  useEffect(() => {
    localStorage.setItem('wishes', JSON.stringify(wishes))
  }, [wishes])

  // 监听hash变化
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash())
    }
    
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // 导航函数 - 更新hash
  const navigate = (page: PageView) => {
    window.location.hash = page === 'admin' ? '' : `#/${page}`
    setCurrentPage(page)
  }

  return (
    <>
      <Toaster 
        position="top-center" 
        richColors
        toastOptions={{
          style: {
            fontSize: '16px',
            padding: '16px 24px'
          }
        }}
      />
      
      {currentPage === 'admin' && (
        <AdminPage 
          wishes={wishes}
          setWishes={setWishes}
          presetNames={presetNames}
          setPresetNames={setPresetNames}
          onNavigate={navigate}
        />
      )}
      
      {currentPage === 'lottery' && (
        <LotteryPage 
          wishes={wishes}
          onNavigate={navigate}
        />
      )}
      
      {currentPage === 'wish-input' && (
        <WishInputPage 
          wishes={wishes}
          setWishes={setWishes}
          presetNames={presetNames}
        />
      )}
    </>
  )
}

export default App
