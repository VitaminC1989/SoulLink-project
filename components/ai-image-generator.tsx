"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Sparkles, Download, Loader2, FileText, Palette, ArrowRight } from "lucide-react"

interface AIImageGeneratorProps {
  onImagesGenerated: (images: string[]) => void
  onPosterCreated: (data: any) => void
  onImageSelected: (image: string) => void
  account: string
}

export default function AIImageGenerator({
  onImagesGenerated,
  onPosterCreated,
  onImageSelected,
  account,
}: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("portrait")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  // 海报编辑相关状态
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [textColor, setTextColor] = useState("#ffffff")
  const [fontSize, setFontSize] = useState([24])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 预设的AI艺术图片
  const presetImages = ["/images/elysia-cipher.png", "/images/lyra-hex.png", "/images/lysander-kairos.png"]

  const generateImages = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    // 重置之前的选择
    setSelectedImage("")

    try {
      // 模拟AI图像生成过程
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // 使用预设的高质量AI艺术图片
      const mockImages = [...presetImages]

      setGeneratedImages(mockImages)
      onImagesGenerated(mockImages)
    } catch (error) {
      console.error("生成图像失败:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = (e: React.MouseEvent, imageUrl: string, index: number) => {
    // 阻止事件冒泡，避免触发图像选择
    e.stopPropagation()
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `ai-generated-${index + 1}.png`
    link.click()
  }

  const createPoster = () => {
    if (!selectedImage || !title) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 设置画布尺寸
    canvas.width = 800
    canvas.height = 1000

    // 创建图像对象
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // 绘制背景图像
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // 添加半透明遮罩
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
      ctx.fillRect(0, canvas.height - 300, canvas.width, 300)

      // 设置文字样式
      ctx.fillStyle = textColor
      ctx.font = `bold ${fontSize[0]}px Arial`
      ctx.textAlign = "center"

      // 绘制标题
      ctx.fillText(title, canvas.width / 2, canvas.height - 200)

      // 绘制描述
      if (description) {
        ctx.font = `${fontSize[0] * 0.6}px Arial`
        const words = description.split(" ")
        let line = ""
        let y = canvas.height - 150

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " "
          const metrics = ctx.measureText(testLine)
          const testWidth = metrics.width
          if (testWidth > canvas.width - 100 && n > 0) {
            ctx.fillText(line, canvas.width / 2, y)
            line = words[n] + " "
            y += fontSize[0] * 0.8
          } else {
            line = testLine
          }
        }
        ctx.fillText(line, canvas.width / 2, y)
      }

      // 添加钱包地址水印
      ctx.font = "12px Arial"
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.textAlign = "right"
      ctx.fillText(`Created by: ${account.slice(0, 6)}...${account.slice(-4)}`, canvas.width - 20, canvas.height - 20)

      // 创建海报数据
      const posterData = {
        title,
        description,
        image: selectedImage,
        canvas: canvas.toDataURL(),
        creator: account,
        timestamp: Date.now(),
      }

      onPosterCreated(posterData)
    }

    img.src = selectedImage
  }

  const downloadPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `poster-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // 修改图片选择处理函数
  const handleImageSelect = (image: string) => {
    setSelectedImage(image)
    onImageSelected(image)
  }

  // 获取图片描述
  const getImageDescription = (imageUrl: string, index: number) => {
    const descriptions = ["赛博朋克风格 - ELYSIA CIPHER", "全息艺术家 - LYRA HEX", "跨维几何学家 - DR. LYSANDER KAIROS"]
    return descriptions[index] || `AI生成图像 ${index + 1}`
  }

  return (
    <div className="space-y-6">
      {/* AI图像生成器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI图像生成器
          </CardTitle>
          <CardDescription>输入关键词和描述，AI将为您生成个性化的头像和背景图像</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">生成提示词</Label>
            <Textarea
              id="prompt"
              placeholder="描述您想要的图像风格，例如：科技感的未来主义头像，蓝色调，简约设计..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">图像风格</Label>
            <div className="flex gap-2 flex-wrap">
              {["portrait", "abstract", "minimalist", "cyberpunk", "artistic"].map((styleOption) => (
                <Badge
                  key={styleOption}
                  variant={style === styleOption ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setStyle(styleOption)}
                >
                  {styleOption}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={generateImages} disabled={isGenerating || !prompt.trim()} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                生成AI图像
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 生成的图像展示 */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI生成的艺术作品</CardTitle>
            <CardDescription>点击选择您喜欢的图像，将自动跳转到NFT铸造页面</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {generatedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-xl ${
                      selectedImage === image
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => handleImageSelect(image)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={getImageDescription(image, index)}
                      className="w-full h-64 object-cover"
                    />

                    {/* 选中状态指示器 */}
                    {selectedImage === image && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-500 text-white shadow-lg">已选择</Badge>
                      </div>
                    )}

                    {/* 点击提示 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                        <ArrowRight className="w-10 h-10 mx-auto mb-3" />
                        <p className="text-lg font-bold">点击选择</p>
                        <p className="text-sm">自动铸造NFT</p>
                      </div>
                    </div>
                  </div>

                  {/* 图片信息和下载按钮 */}
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700 text-center">{getImageDescription(image, index)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => downloadImage(e, image, index)}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载图像
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* 选择提示 */}
            {generatedImages.length > 0 && !selectedImage && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <p className="text-purple-800 font-bold">选择您喜欢的AI艺术作品</p>
                </div>
                <p className="text-purple-600 text-sm">点击任意图像即可自动跳转到NFT铸造页面并开始铸造流程</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 海报编辑器 - 只在选中图像时显示 */}
      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              海报编辑器 (可选)
            </CardTitle>
            <CardDescription>您可以为选中的图像添加文字信息，或直接跳转到NFT铸造</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题 (可选)</Label>
              <Input
                id="title"
                placeholder="输入您的姓名或标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">自我介绍 (可选)</Label>
              <Textarea
                id="description"
                placeholder="简单介绍一下自己..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="textColor">文字颜色</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="textColor"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded border"
                  />
                  <span className="text-sm text-gray-600">{textColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>字体大小: {fontSize[0]}px</Label>
                <Slider value={fontSize} onValueChange={setFontSize} max={48} min={16} step={2} className="w-full" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={createPoster} disabled={!selectedImage || !title} className="flex-1">
                <Palette className="w-4 h-4 mr-2" />
                创建海报
              </Button>
              <Button variant="outline" onClick={downloadPoster} disabled={!selectedImage || !title}>
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 隐藏的画布用于生成海报 */}
      <canvas ref={canvasRef} className="hidden" width={800} height={1000} />

      {/* 海报预览 */}
      {selectedImage && title && (
        <Card>
          <CardHeader>
            <CardTitle>海报预览</CardTitle>
            <CardDescription>您的个性化海报预览，可以直接用于NFT铸造</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-sm mx-auto">
              <img src={selectedImage || "/placeholder.svg"} alt="Poster preview" className="w-full rounded-lg" />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 rounded-b-lg">
                <h3 className="font-bold text-lg" style={{ color: textColor, fontSize: `${fontSize[0] * 0.6}px` }}>
                  {title}
                </h3>
                {description && (
                  <p className="text-sm mt-1 opacity-90" style={{ fontSize: `${fontSize[0] * 0.4}px` }}>
                    {description.slice(0, 100)}...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
