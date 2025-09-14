import { useState } from 'react'
import Book from './components/Book'
import PromptBar from './components/PromptBar'
import NavigationButtons from './components/NavigationButtons'
import Particles from './components/ui/particles'

/**
 * Main App component for the Story Generator
 * Manages story state, page navigation, and API communication
 */
function App() {
  // Story state management
  const [story, setStory] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // API base URL - adjust if your backend runs on different port
  const API_BASE_URL = 'http://localhost:8000'

  /**
   * Generate story from user prompt
   * Calls backend API and updates story state
   */
  const handleGenerateStory = async (prompt) => {
    setIsLoading(true)
    setError(null)
    setCurrentPage(1) // Reset to first page
    
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const storyData = await response.json()
      setStory(storyData)
    } catch (err) {
      console.error('Error generating story:', err)
      setError('Failed to generate story. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Navigate to previous page
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  /**
   * Navigate to next page
   */
  const handleNextPage = () => {
    if (story && currentPage < story.parts.length) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Get current page content and image
  const getCurrentContent = () => {
    if (!story || !story.parts[currentPage - 1]) {
      return { content: '', image: '' }
    }
    
    const currentPart = story.parts[currentPage - 1]
    return {
      content: currentPart.text,
      image: currentPart.image
    }
  }

  const { content, image } = getCurrentContent()
  const totalPages = story ? story.parts.length : 8

  return (
    <>
    <div className='h-screen w-screen flex flex-col items-center justify-center bg-black'>

      <div className="relative z-10">
        {/* Error Message */}
        {error && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30">
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-lg">
              <p>{error}</p>
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-red-800 hover:text-red-900 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
        
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
    </div>

      {/* title of the app */}
      <div className='mb-8 text-center'>
        <h1 className='text-7xl font-bold text-white-800'>Story Generator</h1>
      </div>

      {/* Main Book Display */}
      <div className="relative">
        <Book
          leftContent={content}
          rightImage={image}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>

      {/* Navigation Buttons */}
      <NavigationButtons
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
        hasStory={!!story}
      />

      {/* Prompt Input Bar */}
      <PromptBar
        onGenerate={handleGenerateStory}
        isLoading={isLoading}
      />

      {/* Footer */}
      <footer className="fixed bottom-2 right-4 text-xs text-gray-400">
        Powered by Gemini AI
      </footer>

    </div>
  
  </>
  )
}

export default App
