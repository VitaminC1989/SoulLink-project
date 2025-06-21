"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, ImageIcon, Coins, Upload, Sparkles } from "lucide-react"
import WalletConnect from "@/components/wallet-connect"
import AIImageGenerator from "@/components/ai-image-generator"
import NFTMinter from "@/components/nft-minter"
import RewardSystem from "@/components/reward-system"

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string>("")
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [posterData, setPosterData] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [activeTab, setActiveTab] = useState("generate")
  const [shouldAutoMint, setShouldAutoMint] = useState(false)

  useEffect(() => {
    // 检查是否已连接钱包
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setIsConnected(true)
          setAccount(accounts[0])
        }
      } catch (error) {
        console.error("检查钱包连接失败:", error)
      }
    }
  }

  const handleWalletConnect = (connected: boolean, accountAddress: string) => {
    setIsConnected(connected)
    setAccount(accountAddress)

    // 如果断开连接，重置所有状态
    if (!connected) {
      setGeneratedImages([])
      setPosterData(null)
      setSelectedImage("")
      setActiveTab("generate")
      setShouldAutoMint(false)
    }
  }

  const handleImagesGenerated = (images: string[]) => {
    setGeneratedImages(images)
  }

  const handleImageSelected = (image: string) => {
    console.log("图像已选择:", image)
    setSelectedImage(image)
    // 重置海报数据
    setPosterData(null)
    // 设置自动铸造标志
    setShouldAutoMint(true)
    // 自动切换到NFT铸造Tab
    setTimeout(() => {
      setActiveTab("mint")
    }, 500) // 稍微延迟一下，让用户看到选择效果
  }

  const handlePosterCreated = (data: any) => {
    setPosterData(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            去中心化身份认证 & AI个性化NFT平台
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            通过以太坊钱包认证身份，使用AI生成个性化内容，创建独特的自我介绍海报并铸造为NFT
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnect onConnect={handleWalletConnect} isConnected={isConnected} account={account} />
        </div>

        {/* Main Content - 只有连接钱包后才显示 */}
        {isConnected ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI生成与海报制作
              </TabsTrigger>
              <TabsTrigger value="mint" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                NFT铸造
                {selectedImage && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
              </TabsTrigger>
              <TabsTrigger value="rewards" className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                奖励系统
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <AIImageGenerator
                onImagesGenerated={handleImagesGenerated}
                onPosterCreated={handlePosterCreated}
                onImageSelected={handleImageSelected}
                account={account}
              />
            </TabsContent>

            <TabsContent value="mint">
              <NFTMinter
                posterData={posterData}
                selectedImage={selectedImage}
                account={account}
                shouldAutoMint={shouldAutoMint}
                onAutoMintComplete={() => setShouldAutoMint(false)}
              />
            </TabsContent>

            <TabsContent value="rewards">
              <RewardSystem account={account} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <CardTitle>连接钱包开始使用</CardTitle>
              <CardDescription>请连接您的MetaMask钱包以访问去中心化身份认证和NFT功能</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-sm text-gray-600">
                <p>🎨 AI生成个性化艺术作品</p>
                <p>🖼️ 创建独特的自我介绍海报</p>
                <p>💎 铸造专属NFT收藏品</p>
                <p>🎁 获得创作奖励和收益</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Overview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Wallet className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">去中心化身份认证</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">通过MetaMask钱包进行身份认证，确保用户数据的自主控制和隐私保护</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ImageIcon className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">AI个性化内容</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">基于关键词自动生成个性化头像和背景，提升用户体验和内容独特性</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Upload className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">NFT铸造与存储</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">将海报铸造为NFT并存储到IPFS，确保去中心化存储和数据持久性</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
