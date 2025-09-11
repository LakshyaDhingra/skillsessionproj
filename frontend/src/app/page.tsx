"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { BookOpen, Sparkles, Star, Heart, ArrowLeft, ArrowRight, Home, Wand2 } from "lucide-react"
import Image from "next/image"

interface StoryPart {
  text: string;
  image: string;
}

interface GeneratedStory {
  title: string;
  parts: StoryPart[];
}

export default function StoryBookGenerator() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showBook, setShowBook] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [isPageTurning, setIsPageTurning] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render markdown-style formatting in text
  const renderFormattedText = (text: string) => {
    // Split text by markdown patterns and render appropriately
    const parts = text.split(/(##\s*[^\n]+|\*\*[^*]+\*\*)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('## ')) {
        // Header
        const headerText = part.replace('## ', '').trim()
        return (
          <h3 key={index} className="text-lg sm:text-xl font-bold text-primary mb-2 mt-4">
            {headerText}
          </h3>
        )
      } else if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        const boldText = part.replace(/\*\*/g, '')
        return (
          <strong key={index} className="font-bold text-primary">
            {boldText}
          </strong>
        )
      } else {
        // Regular text
        return part ? (
          <span key={index}>{part}</span>
        ) : null
      }
    })
  }

  // Get story data from generated story or fallback to demo
  const storyPages = generatedStory?.parts || [
    {
      text: "## The Magical Beginning\n\nOnce upon a time, in a **magical forest** filled with talking animals and glowing flowers, there lived a brave little rabbit named **Luna**. She had the softest white fur and the brightest blue eyes that sparkled like stars in the night sky.",
      image: "/placeholder.svg",
    },
    {
      text: "## The Colors Disappear\n\nOne sunny morning, Luna discovered that all the colors in the forest were slowly disappearing! The **red roses** turned gray, the **golden sunflowers** became silver, and even the rainbow bridge lost its beautiful hues.",
      image: "/placeholder.svg",
    },
    {
      text: "## The Quest Begins\n\nDetermined to save her home, Luna set off on an adventure to find the **Color Crystal**, a legendary gem that could restore all the missing colors. Along the way, she met **Oliver the wise owl** who offered to help her on this important quest.",
      image: "/placeholder.svg",
    },
    {
      text: "## The Happy Ending\n\nAfter many challenges and with the help of her new friends, Luna found the **Color Crystal** hidden in a cave behind a waterfall. As she touched it, brilliant colors burst forth like **fireworks**, painting the entire forest in vibrant hues once again!",
      image: "/placeholder.svg",
    },
  ]

  const storyTitle = generatedStory?.title || "Luna's Colorful Adventure"

  const handleGenerateStory = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate story: ${response.status}`)
      }

      const story: GeneratedStory = await response.json()
      setGeneratedStory(story)
      setShowBook(true)
      setCurrentPage(0)
    } catch (error) {
      console.error('Error generating story:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate story')
    } finally {
      setIsGenerating(false)
    }
  }

  const nextPage = async () => {
    if (currentPage < storyPages.length - 1) {
      setIsPageTurning(true)
      await new Promise((resolve) => setTimeout(resolve, 300))
      setCurrentPage(currentPage + 1)
      setIsPageTurning(false)
    }
  }

  const prevPage = async () => {
    if (currentPage > 0) {
      setIsPageTurning(true)
      await new Promise((resolve) => setTimeout(resolve, 300))
      setCurrentPage(currentPage - 1)
      setIsPageTurning(false)
    }
  }

  const resetToHome = () => {
    setShowBook(false)
    setPrompt("")
    setCurrentPage(0)
    setGeneratedStory(null)
    setError(null)
  }

  if (showBook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-2 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-4">
            <Button
              onClick={resetToHome}
              variant="outline"
              className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-2 border-primary/20 interactive-card order-2 sm:order-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Generator
            </Button>
            <div className="text-center order-1 sm:order-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary animate-magical-entrance">
                {storyTitle}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Page {currentPage + 1} of {storyPages.length}
              </p>
            </div>
            <div className="w-32 order-3 hidden sm:block"></div>
          </div>

          {/* Enhanced Book Layout with 3D effects */}
          <Card
            className={`bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden book-3d interactive-card ${mounted ? "animate-magical-entrance" : ""}`}
          >
            <div className="grid lg:grid-cols-2 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
              {/* Left Page - Text with enhanced animations */}
              <div
                className={`p-4 sm:p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 book-page ${isPageTurning ? "animate-page-turn" : "animate-slide-in-left"}`}
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-sparkle" />
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 animate-float" />
                    <span className="text-base sm:text-lg font-semibold text-primary">Chapter {currentPage + 1}</span>
                  </div>
                  <div className="text-sm sm:text-lg lg:text-xl leading-relaxed text-foreground font-medium text-balance">
                    {renderFormattedText(storyPages[currentPage].text)}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Heart className="w-4 h-4 text-red-500 animate-bounce-gentle" />
                    <Star className="w-4 h-4 text-yellow-500 animate-sparkle" />
                    <Heart className="w-4 h-4 text-pink-500 animate-float" />
                  </div>
                </div>
              </div>

              {/* Right Page - Image with enhanced effects */}
              <div
                className={`p-4 sm:p-8 lg:p-12 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 book-page ${isPageTurning ? "animate-page-turn" : "animate-slide-in-right"}`}
              >
                <div className="relative w-full max-w-sm lg:max-w-md aspect-square group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl relative z-10 bg-gradient-to-br from-purple-100 to-pink-100">
                    {storyPages[currentPage].image.startsWith('data:') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={storyPages[currentPage].image}
                        alt={`Story illustration for page ${currentPage + 1}`}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        style={{ maxHeight: '100%', maxWidth: '100%' }}
                        loading="lazy"
                      />
                    ) : (
                      <Image
                        src={storyPages[currentPage].image || "/placeholder.svg"}
                        alt={`Story illustration for page ${currentPage + 1}`}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2 z-20">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500 animate-float" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 z-20">
                    <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-500 animate-sparkle" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Navigation with better mobile design */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 gap-4">
              <Button
                onClick={prevPage}
                disabled={currentPage === 0 || isPageTurning}
                variant="outline"
                className="bg-white/90 backdrop-blur-sm interactive-card disabled:opacity-50 w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {/* Enhanced page indicators */}
              <div className="flex gap-2 sm:gap-3">
                {storyPages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isPageTurning) {
                        setIsPageTurning(true)
                        setTimeout(() => {
                          setCurrentPage(index)
                          setIsPageTurning(false)
                        }, 300)
                      }
                    }}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                      index === currentPage
                        ? "bg-primary scale-125 animate-pulse-glow"
                        : "bg-muted hover:bg-primary/50 hover:scale-110"
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={nextPage}
                disabled={currentPage === storyPages.length - 1 || isPageTurning}
                variant="outline"
                className="bg-white/90 backdrop-blur-sm interactive-card disabled:opacity-50 w-full sm:w-auto"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Reading Progress</span>
              </div>
              <div className="w-32 bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentPage + 1) / storyPages.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round(((currentPage + 1) / storyPages.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8">
        {/* Enhanced Header with magical elements */}
        <div className={`text-center space-y-4 ${mounted ? "animate-magical-entrance" : ""}`}>
          <div className="flex justify-center items-center gap-3 mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-20 animate-pulse-glow"></div>
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-float relative z-10" />
            <Wand2 className="w-6 h-6 sm:w-8 sm:h-8 text-secondary animate-sparkle relative z-10" />
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-accent animate-bounce-gentle relative z-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance storybook-gradient bg-clip-text text-transparent">
            Magical Story Generator
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-lg mx-auto">
            {"Tell me what kind of story you'd like, and I'll create a magical adventure just for you!"}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50 border-2 border-red-200 text-red-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <p className="font-medium">Error generating story:</p>
            </div>
            <p className="mt-2 text-sm">{error}</p>
            <p className="mt-2 text-xs text-red-600">
              Make sure the backend server is running on http://localhost:8000
            </p>
          </Card>
        )}

        {/* Enhanced Story Prompt Input */}
        <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-primary/20 interactive-card">
          <div className="space-y-6">
            <div className="space-y-3">
              <label
                htmlFor="story-prompt"
                className="text-lg font-semibold text-primary block flex items-center gap-2"
              >
                <Star className="w-5 h-5 animate-sparkle" />
                {"What's your story idea?"}
              </label>
              <Input
                id="story-prompt"
                placeholder="A brave princess who saves dragons, a magical tree that grants wishes, a robot who learns to paint..."
                value={prompt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
                className="text-base sm:text-lg p-4 h-12 sm:h-14 bg-white border-2 border-primary/30 focus:border-primary rounded-xl"
                disabled={isGenerating}
              />
            </div>

            <Button
              onClick={handleGenerateStory}
              disabled={!prompt.trim() || isGenerating}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 interactive-card"
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">
                    Creating Your Magical Story & Beautiful Images...
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  Generate My Story!
                </div>
              )}
            </Button>
          </div>
        </Card>

        {/* Enhanced Example Prompts */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Need inspiration? Try these magical ideas:
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {["A unicorn who lost her rainbow", "A boy who can talk to stars", "A magical library adventure"].map(
              (example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(example)}
                  className="bg-white/70 hover:bg-white/90 border-primary/30 text-primary interactive-card text-xs sm:text-sm"
                  disabled={isGenerating}
                >
                  {example}
                </Button>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
