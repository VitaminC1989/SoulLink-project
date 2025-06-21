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
import { Sparkles, Download, Loader2, FileText, Palette, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

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
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 预设的AI艺术图片 - 使用新的4张图片
  const aiArtImages = [
    "/images/lyra-hex.png", // LYRA HEX - 全息艺术家
    "/images/elysia-cipher.png", // ELYSIA CIPHER - 赛博遗物策展人
    "/images/lysander-kairos.png", // DR. LYSANDER KAIROS - 跨维几何学家
    "/images/orion-kodex.png", // ORION KODEX - 区块链元宇宙架构师
  ]

  const generateImages = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    // 重置之前的选择
    setSelectedImage("")

    try {
      // 模拟AI图像生成过程
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // 根据提示词和风格选择不同的图片组合，现在显示所有4张图片
      let selectedImages: string[] = []

      if (style === "cyberpunk" || prompt.toLowerCase().includes("cyber") || prompt.toLowerCase().includes("digital")) {
        selectedImages = [aiArtImages[1], aiArtImages[0], aiArtImages[3], aiArtImages[2]] // 更偏向赛博朋克风格
      } else if (
        style === "portrait" ||
        prompt.toLowerCase().includes("portrait") ||
        prompt.toLowerCase().includes("face")
      ) {
        selectedImages = [aiArtImages[0], aiArtImages[1], aiArtImages[2], aiArtImages[3]] // 人物肖像顺序
      } else if (
        style === "abstract" ||
        prompt.toLowerCase().includes("abstract") ||
        prompt.toLowerCase().includes("art") ||
        prompt.toLowerCase().includes("geometric")
      ) {
        selectedImages = [aiArtImages[2], aiArtImages[3], aiArtImages[1], aiArtImages[0]] // 更偏向抽象艺术
      } else if (style === "glitch" || prompt.toLowerCase().includes("glitch")) {
        selectedImages = [aiArtImages[1], aiArtImages[0], aiArtImages[2], aiArtImages[3]] // 故障艺术风格
      } else {
        // 默认显示所有4张图片
        selectedImages = [...aiArtImages]
      }

      setGeneratedImages(selectedImages)
      onImagesGenerated(selectedImages)
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

    // 设置画布尺寸为1024:1536比例
    canvas.width = 1024
    canvas.height = 1536

    // 创建图像对象
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // 绘制背景图像
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // 添加半透明遮罩
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
      ctx.fillRect(0, canvas.height - 400, canvas.width, 400)

      // 设置文字样式
      ctx.fillStyle = textColor
      ctx.font = `bold ${fontSize[0]}px Arial`
      ctx.textAlign = "center"

      // 绘制标题
      ctx.fillText(title, canvas.width / 2, canvas.height - 280)

      // 绘制描述
      if (description) {
        ctx.font = `${fontSize[0] * 0.6}px Arial`
        const words = description.split(" ")
        let line = ""
        let y = canvas.height - 220

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
      ctx.font = "16px Arial"
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.textAlign = "right"
      ctx.fillText(`Created by: ${account.slice(0, 6)}...${account.slice(-4)}`, canvas.width - 30, canvas.height - 30)

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
  const getImageDescription = (imageUrl: string) => {
    const index = aiArtImages.indexOf(imageUrl)
    const descriptions = [
      "LYRA HEX - 全息艺术家，NFT创作者",
      "ELYSIA CIPHER - 赛博遗物策展人",
      "DR. LYSANDER KAIROS - 跨维几何学家",
      "ORION KODEX - 区块链元宇宙架构师",
    ]
    return descriptions[index] || "AI生成的数字艺术作品"
  }

  // 滚动控制函数
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
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
          <CardDescription>输入关键词和描述，AI将为您生成个性化的数字艺术作品</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">生成提示词</Label>
            <Textarea
              id="prompt"
              placeholder="描述您想要的图像风格，例如：赛博朋克风格的数字艺术，全息艺术家，区块链元宇宙，跨维几何..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">图像风格</Label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "portrait", label: "人物肖像" },
                { key: "cyberpunk", label: "赛博朋克" },
                { key: "abstract", label: "抽象艺术" },
                { key: "digital", label: "数字艺术" },
                { key: "glitch", label: "故障艺术" },
              ].map((styleOption) => (
                <Badge
                  key={styleOption.key}
                  variant={style === styleOption.key ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setStyle(styleOption.key)}
                >
                  {styleOption.label}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={generateImages} disabled={isGenerating || !prompt.trim()} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI正在创作中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                生成AI艺术作品
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 生成的图像展示 - 支持滑动 */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI生成的艺术作品</CardTitle>
            <CardDescription>滑动浏览所有作品，点击选择您喜欢的数字艺术作品</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* 滚动控制按钮 */}
              {generatedImages.length > 3 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
                    onClick={scrollLeft}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
                    onClick={scrollRight}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* 滚动容器 */}
              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
                style={{
                  scrollSnapType: "x mandatory",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {generatedImages.map((image, index) => (
                  <div key={index} className="flex-shrink-0 w-72" style={{ scrollSnapAlign: "start" }}>
                    <div className="relative group">
                      <div
                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg ${
                          selectedImage === image
                            ? "border-purple-500 ring-2 ring-purple-200"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                        onClick={() => handleImageSelect(image)}
                      >
                        {/* 使用1024:1536比例 (2:3) */}
                        <div className="aspect-[2/3] overflow-hidden">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`AI Generated Art ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* 选中状态指示器 */}
                        {selectedImage === image && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-purple-500 text-white">已选择</Badge>
                          </div>
                        )}

                        {/* 点击提示 */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                            <ArrowRight className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm font-medium">点击选择并铸造NFT</p>
                          </div>
                        </div>
                      </div>

                      {/* 图片描述和下载按钮 */}
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-gray-600 text-center font-medium">{getImageDescription(image)}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => downloadImage(e, image, index)}
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          下载艺术作品
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 选择提示 */}
            {generatedImages.length > 0 && !selectedImage && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg text-center">
                <p className="text-purple-800 font-medium">
                  ✨ 滑动浏览所有作品，点击任意艺术作品即可自动跳转到NFT铸造页面
                </p>
                <p className="text-sm text-purple-600 mt-1">这些独特的数字艺术作品将成为您专属的NFT收藏</p>
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
            <CardDescription>您可以为选中的艺术作品添加文字信息，或直接跳转到NFT铸造</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题 (可选)</Label>
              <Input
                id="title"
                placeholder="为您的数字艺术作品起个名字"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">艺术描述 (可选)</Label>
              <Textarea
                id="description"
                placeholder="描述这件艺术作品的创作理念或特色..."
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
                创建艺术海报
              </Button>
              <Button variant="outline" onClick={downloadPoster} disabled={!selectedImage || !title}>
                <Download className="w-4 h-4 mr-2" />
                下载海报
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 隐藏的画布用于生成海报 - 更新为1024:1536比例 */}
      <canvas ref={canvasRef} className="hidden" width={1024} height={1536} />

      {/* 海报预览 */}
      {selectedImage && title && (
        <Card>
          <CardHeader>
            <CardTitle>艺术海报预览</CardTitle>
            <CardDescription>您的个性化艺术海报预览，可以直接用于NFT铸造</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-sm mx-auto">
              <div className="aspect-[2/3] overflow-hidden rounded-lg">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Art poster preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4">
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* 添加CSS样式隐藏滚动条 */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
