// Main App Component
// This is the root component of our React application

import React, { useState } from 'react';
import './App.css';

// Import our custom UI components
import Button from './components/ui/button.jsx';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card.jsx';
import Input from './components/ui/input.jsx';

/**
 * Main App Component
 * This component manages the entire application state and renders the UI
 */
function App() {
  // State for user input (story prompt)
  const [prompt, setPrompt] = useState('');
  
  // State to track if we're currently generating a story
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State to store the generated story
  const [generatedStory, setGeneratedStory] = useState(null);
  
  // State for error handling
  const [error, setError] = useState(null);
  
  // State to control whether to show the story book view
  const [showBook, setShowBook] = useState(false);
  
  // State for current page in the story book
  const [currentPage, setCurrentPage] = useState(0);

  /**
   * Function to handle story generation
   * Sends a request to the backend API to generate a story
   */
  const handleGenerateStory = async () => {
    // Don't proceed if prompt is empty
    if (!prompt.trim()) {
      setError('Please enter a story idea!');
      return;
    }

    // Reset error state and start generating
    setError(null);
    setIsGenerating(true);
    
    try {
      // Make API call to backend
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      // Check if request was successful
      if (!response.ok) {
        throw new Error(`Failed to generate story: ${response.status}`);
      }

      // Parse the response
      const story = await response.json();
      
      // Update state with the generated story
      setGeneratedStory(story);
      setShowBook(true);
      setCurrentPage(0);
      
    } catch (error) {
      console.error('Error generating story:', error);
      setError(error.message || 'Failed to generate story. Make sure the backend server is running.');
    } finally {
      // Always stop the loading state
      setIsGenerating(false);
    }
  };

  /**
   * Function to go to the next page in the story book
   */
  const nextPage = () => {
    if (generatedStory && currentPage < generatedStory.parts.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Function to go to the previous page in the story book
   */
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Function to reset and go back to the main screen
   */
  const resetToHome = () => {
    setShowBook(false);
    setPrompt('');
    setCurrentPage(0);
    setGeneratedStory(null);
    setError(null);
  };

  // Sample example prompts to inspire users
  const examplePrompts = [
    "A brave princess who saves dragons",
    "A magical tree that grants wishes", 
    "A robot who learns to paint"
  ];

  // If we're showing the story book, render the book view
  if (showBook && generatedStory) {
    const currentStoryPart = generatedStory.parts[currentPage];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with back button and title */}
          <div className="flex justify-between items-center mb-8">
            <Button onClick={resetToHome} variant="outline">
              ← Back to Generator
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-purple-800">
                {generatedStory.title}
              </h1>
              <p className="text-gray-600">
                Page {currentPage + 1} of {generatedStory.parts.length}
              </p>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>

          {/* Story book card */}
          <Card className="bg-white shadow-lg">
            <div className="grid md:grid-cols-2 min-h-[500px]">
              {/* Text side */}
              <div className="p-8 flex flex-col justify-center bg-yellow-50">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-purple-800">
                    Chapter {currentPage + 1}
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-800">
                    {currentStoryPart.text}
                  </p>
                </div>
              </div>
              
              {/* Image side */}
              <div className="p-8 flex items-center justify-center bg-blue-50">
                <div className="w-full max-w-sm aspect-square bg-white rounded-lg shadow-md flex items-center justify-center">
                  {currentStoryPart.image && currentStoryPart.image.startsWith('data:') ? (
                    <img
                      src={currentStoryPart.image}
                      alt={`Story illustration for page ${currentPage + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-500 text-center">
                      <p>Story Illustration</p>
                      <p className="text-sm">Page {currentPage + 1}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center p-6 bg-gray-50">
              <Button 
                onClick={prevPage}
                disabled={currentPage === 0}
                variant="outline"
              >
                ← Previous
              </Button>
              
              {/* Page indicators */}
              <div className="flex gap-2">
                {generatedStory.parts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentPage 
                        ? 'bg-purple-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                onClick={nextPage}
                disabled={currentPage === generatedStory.parts.length - 1}
                variant="outline"
              >
                Next →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Main generator screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-purple-800">
            ✨ Magical Story Generator
          </h1>
          <p className="text-xl text-gray-600">
            Tell me what kind of story you'd like, and I'll create a magical adventure just for you!
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50 border-2 border-red-200">
            <p className="text-red-800 font-medium">⚠️ {error}</p>
          </Card>
        )}

        {/* Story Input Form */}
        <Card className="p-8 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>What's your story idea? ⭐</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              placeholder="A brave princess who saves dragons, a magical tree that grants wishes, a robot who learns to paint..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="text-lg p-4 h-14"
            />
            
            <Button
              onClick={handleGenerateStory}
              disabled={!prompt.trim() || isGenerating}
              className="w-full h-14 text-lg font-semibold"
            >
              {isGenerating ? (
                <span>🎨 Creating Your Magical Story...</span>
              ) : (
                <span>🪄 Generate My Story!</span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Example Prompts */}
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            ✨ Need inspiration? Try these magical ideas:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {examplePrompts.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(example)}
                disabled={isGenerating}
                className="text-purple-700 border-purple-300 hover:bg-purple-50"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;