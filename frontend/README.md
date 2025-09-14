# Magical Story Generator - Frontend

A React application that generates magical stories with illustrations using AI.

## Project Structure

```
src/
├── components/
│   └── ui/
│       ├── button.jsx      # Reusable button component
│       ├── card.jsx        # Card components for layouts
│       └── input.jsx       # Input field component
├── App.jsx                 # Main application component
├── main.jsx               # Application entry point
├── App.css                # App-specific styles
└── index.css              # Global styles
```

## Components

### Button (`components/ui/button.jsx`)
- Simple, reusable button component
- Supports different variants: `default`, `outline`, `secondary`, `destructive`
- Supports different sizes: `sm`, `default`, `lg`
- Fully accessible with focus states

### Card (`components/ui/card.jsx`)
- Set of card components for creating containers
- Includes: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- Responsive design with hover effects

### Input (`components/ui/input.jsx`)
- Styled input field component
- Supports all standard input types
- Consistent styling with focus states

### App (`App.jsx`)
- Main application component
- Handles story generation and display
- Two main views: Generator and Story Book
- Connects to backend API at `http://localhost:8000`

## Features

1. **Story Generator**: Users can input story ideas and generate magical stories
2. **Story Book View**: Generated stories are displayed in a beautiful book layout
3. **Page Navigation**: Users can navigate through story pages
4. **Responsive Design**: Works on desktop and mobile devices
5. **Error Handling**: Displays helpful error messages
6. **Loading States**: Shows progress during story generation

## API Integration

The frontend connects to a backend API with the following endpoint:
- `POST /generate` - Generates a story based on user prompt

Expected response format:
```json
{
  "title": "Story Title",
  "parts": [
    {
      "text": "Story text for this part",
      "image": "base64_encoded_image_or_url"
    }
  ]
}
```

## Development

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`

## Styling

- Uses vanilla CSS with utility classes
- Responsive design with mobile-first approach
- Smooth animations and transitions
- Accessible focus states
- Beautiful gradients and shadows