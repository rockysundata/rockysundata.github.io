import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, RotateCcw, Upload, Users, Gift, ArrowRight, Download, QrCode, Save, FileUp } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import type { WishItem, PresetName, PageView } from '@/types'

interface AdminPageProps {
  wishes: WishItem[]
  setWishes: (wishes: WishItem[]) => void
  presetNames: PresetName[]
  setPresetNames: (names: PresetName[]) => void
  onNavigate: (page: PageView) => void
}

export function AdminPage({ wishes, setWishes, presetNames, setPresetNames, onNavigate }: AdminPageProps) {
  const [nameInput, setNameInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backupInputRef = useRef<HTMLInputElement>(null)

  // 添加预设姓名
  const handleAddName = () => {
    if (!nameInput.trim()) {
      toast.error('请输入姓名')
      return
    }
    
    // 检查是否已存在
    if (presetNames.some(n => n.name === nameInput.trim())) {
      toast.error('该姓名已存在')
      return
    }

    const newName: PresetName = {
      id: Date.now().toString(),
      name: nameInput.trim()
    }
    
    setPresetNames([...presetNames, newName])
    setNameInput('')
    toast.success('添加成功')
  }

  // 删除预设姓名
  const handleDeleteName = (id: string) => {
    const nameToDelete = presetNames.find(n => n.id === id)?.name
    if (nameToDelete) {
      // 检查是否有关联的愿望
      const hasWish = wishes.some(w => w.name === nameToDelete)
      if (hasWish && !confirm('该姓名已有关联的愿望，删除后愿望也会被删除，确定继续吗？')) {
        return
      }
      // 删除关联的愿望
      if (hasWish) {
        setWishes(wishes.filter(w => w.name !== nameToDelete))
      }
    }
    setPresetNames(presetNames.filter(n => n.id !== id))
    toast.success('删除成功')
  }

  // 删除愿望
  const handleDeleteWish = (id: string) => {
    if (confirm('确定要删除这条愿望吗？')) {
      setWishes(wishes.filter(w => w.id !== id))
      toast.success('愿望已删除')
    }
  }

  // 清空所有预设姓名
  const handleClearNames = () => {
    if (presetNames.length === 0) return
    if (wishes.length > 0) {
      if (!confirm('清空所有人员将同时删除所有愿望，确定继续吗？')) {
        return
      }
      setWishes([])
    }
    setPresetNames([])
    toast.success('已清空')
  }

  // 清空所有愿望
  const handleClearWishes = () => {
    if (wishes.length === 0) return
    if (confirm('确定要清空所有愿望吗？')) {
      setWishes([])
      toast.success('愿望已清空')
    }
  }

  // 下载模板
  const downloadTemplate = () => {
    const templateData = [
      { 姓名: '张三' },
      { 姓名: '李四' },
      { 姓名: '王五' }
    ]
    
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '人员名单')
    XLSX.writeFile(wb, '人员名单模板.xlsx')
    toast.success('模板下载成功')
  }

  // 导出完整数据备份
  const exportBackup = () => {
    const backupData = {
      presetNames,
      wishes,
      exportTime: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `骏采星驰数据备份_${new Date().toLocaleDateString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`已导出备份：${presetNames.length}人, ${wishes.length}条愿望`)
  }

  // 导入数据备份
  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const backupData = JSON.parse(content)
        
        if (!backupData.presetNames || !Array.isArray(backupData.presetNames)) {
          toast.error('备份文件格式错误：缺少人员名单')
          return
        }
        
        if (!backupData.wishes || !Array.isArray(backupData.wishes)) {
          toast.error('备份文件格式错误：缺少愿望列表')
          return
        }

        // 确认是否覆盖
        if (presetNames.length > 0 || wishes.length > 0) {
          if (!confirm(`当前已有 ${presetNames.length} 人、${wishes.length} 条愿望，导入备份将覆盖现有数据，确定继续吗？`)) {
            return
          }
        }

        setPresetNames(backupData.presetNames)
        setWishes(backupData.wishes)
        
        toast.success(`导入成功！${backupData.presetNames.length} 人，${backupData.wishes.length} 条愿望`)
        
      } catch (error) {
        toast.error('备份文件解析失败，请检查文件格式')
      } finally {
        if (backupInputRef.current) {
          backupInputRef.current.value = ''
        }
      }
    }
    
    reader.readAsText(file)
  }

  // 导入Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          toast.error('文件读取失败')
          return
        }

        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]
        
        if (jsonData.length === 0) {
          toast.error('Excel 文件为空')
          return
        }

        let nameIndex = 0
        let startRow = 0

        const firstRow = jsonData[0]
        if (firstRow && (firstRow[0]?.toString().includes('姓名') || firstRow[0]?.toString().includes('名字'))) {
          startRow = 1
        }

        const newNames: PresetName[] = []
        let importedCount = 0

        for (let i = startRow; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (!row || row.length === 0) continue

          const name = row[nameIndex]?.toString().trim()
          if (name && !presetNames.some(n => n.name === name)) {
            newNames.push({
              id: `${Date.now()}_${i}`,
              name
            })
            importedCount++
          }
        }

        if (newNames.length > 0) {
          setPresetNames([...presetNames, ...newNames])
          toast.success(`成功导入 ${importedCount} 人`)
        } else {
          toast.error('未找到新的有效姓名')
        }

      } catch (error) {
        toast.error('文件解析失败')
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }

    reader.readAsBinaryString(file)
  }

  // 统计
  const submittedCount = wishes.length
  const unsubmittedCount = presetNames.length - submittedCount

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
            🐴 骏采星驰 后台管理
          </h1>
          <p className="text-gray-600">总编室新春活动 - 人员名单与愿望管理</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">预设人员</p>
                <p className="text-3xl font-bold text-blue-700">{presetNames.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">已提交愿望</p>
                <p className="text-3xl font-bold text-green-700">{submittedCount}</p>
              </div>
              <Gift className="w-10 h-10 text-green-400" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">待提交</p>
                <p className="text-3xl font-bold text-amber-700">{unsubmittedCount}</p>
              </div>
              <QrCode className="w-10 h-10 text-amber-400" />
            </CardContent>
          </Card>
        </div>

        {/* 数据备份区域 */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-purple-700 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  数据备份
                </h3>
                <p className="text-sm text-purple-600">数据保存在本设备，更换设备前请导出备份</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={backupInputRef}
                  accept=".json"
                  onChange={importBackup}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => backupInputRef.current?.click()}
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  <FileUp className="w-4 h-4 mr-1" />
                  导入备份
                </Button>
                <Button
                  size="sm"
                  onClick={exportBackup}
                  disabled={presetNames.length === 0 && wishes.length === 0}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Save className="w-4 h-4 mr-1" />
                  导出备份
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 愿望录入链接 */}
        <Card className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-red-700">愿望录入页面</h3>
              <p className="text-sm text-red-600">将此页面二维码分享给同事，让他们提交新年愿望</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-3 py-1 bg-white rounded text-sm text-gray-600">
                /#/wish-input
              </code>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="names" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="names" className="text-base">
              <Users className="w-4 h-4 mr-2" />
              人员名单 ({presetNames.length})
            </TabsTrigger>
            <TabsTrigger value="wishes" className="text-base">
              <Gift className="w-4 h-4 mr-2" />
              愿望列表 ({wishes.length})
            </TabsTrigger>
          </TabsList>

          {/* 人员名单 */}
          <TabsContent value="names">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="flex items-center justify-between">
                  <span>预设人员名单</span>
                  <span className="text-sm font-normal text-gray-500">共 {presetNames.length} 人</span>
                </CardTitle>
                <CardDescription>管理可提交愿望的人员名单，支持Excel导入</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* 导入区域 */}
                <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      导入Excel
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadTemplate}
                      className="text-blue-500"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      下载模板
                    </Button>
                  </div>
                </div>

                {/* 手动添加 */}
                <div className="flex gap-3 mb-6">
                  <Input
                    placeholder="输入姓名"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddName()}
                  />
                  <Button 
                    onClick={handleAddName}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加
                  </Button>
                </div>

                {/* 名单表格 */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-16 text-center">序号</TableHead>
                        <TableHead>姓名</TableHead>
                        <TableHead className="w-32">状态</TableHead>
                        <TableHead className="w-16 text-center">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {presetNames.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                            暂无人员，请添加或导入
                          </TableCell>
                        </TableRow>
                      ) : (
                        presetNames.map((item, index) => {
                          const hasWish = wishes.some(w => w.name === item.name)
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="text-center">{index + 1}</TableCell>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>
                                {hasWish ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    <Gift className="w-3 h-3 mr-1" />
                                    已提交
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                    待提交
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteName(item.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleClearNames}
                    disabled={presetNames.length === 0}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 愿望列表 */}
          <TabsContent value="wishes">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center justify-between">
                  <span>大家的新年愿望</span>
                  <span className="text-sm font-normal text-gray-500">共 {wishes.length} 条</span>
                </CardTitle>
                <CardDescription>愿望一旦提交不可修改，但可以删除</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-16 text-center">序号</TableHead>
                        <TableHead>姓名</TableHead>
                        <TableHead>新年愿望</TableHead>
                        <TableHead className="w-20 text-center">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wishes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                            暂无愿望，请分享录入页面二维码给同事
                          </TableCell>
                        </TableRow>
                      ) : (
                        wishes.map((wish, index) => (
                          <TableRow key={wish.id}>
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell className="font-medium">{wish.name}</TableCell>
                            <TableCell className="max-w-md">
                              <p className="text-gray-700 line-clamp-2">{wish.wish}</p>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteWish(wish.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleClearWishes}
                    disabled={wishes.length === 0}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    清空所有愿望
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 去抽奖按钮 */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => onNavigate('lottery')}
            disabled={wishes.length < 2}
            className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white rounded-full shadow-lg"
          >
            去抽奖
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
          {wishes.length < 2 && (
            <p className="mt-2 text-amber-600 text-sm">
              至少需要 2 条愿望才能开始抽奖
            </p>
          )}
        </div>

        {/* 页脚 */}
        <div className="mt-8 text-center text-sm text-gray-400">
          骏采星驰 · 总编室新春活动
        </div>
      </div>
    </div>
  )
}
