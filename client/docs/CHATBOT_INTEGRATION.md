# ChatBot Integration Documentation

## Overview
This document describes the ChatBot integration for the PlumbConnect frontend application. The chatbot provides AI-powered assistance to users with a fixed bottom-right corner interface.

## Features
- 🤖 AI-powered responses using backend chatbot service
- 💬 Real-time conversation interface
- 🔒 Authentication-based access
- 📱 Responsive design for mobile and desktop
- 🌙 Dark mode support
- 🗑️ Clear conversation functionality
- ⌨️ Keyboard shortcuts (Enter to send)
- 📜 Message history with timestamps
- 🔄 Loading states and error handling

## File Structure
```
client/
├── components/
│   └── ChatBot.tsx              # Main chatbot component
├── services/
│   └── chatbotApi.ts           # API service for chatbot endpoints
├── hooks/
│   └── useChatBot.ts           # Custom hook for chatbot state management
├── styles/
│   └── chatbot.css             # Chatbot-specific styles
└── docs/
    └── CHATBOT_INTEGRATION.md  # This documentation
```

## Components

### ChatBot.tsx
Main chatbot component that renders:
- Fixed bottom-right toggle button
- Expandable chat window
- Message history display
- Input field with send button
- Header with clear chat option

### useChatBot.ts
Custom hook that manages:
- Message state
- Loading states
- Session management
- API calls
- Error handling

### chatbotApi.ts
API service that handles:
- Authentication headers
- API endpoint calls
- Response parsing
- Error handling

## API Endpoints
The chatbot integrates with the following backend endpoints:

- `GET /api/chatbot/conversations/` - Get user conversations
- `GET /api/chatbot/conversations/{id}/` - Get specific conversation
- `POST /api/chatbot/conversations/new/` - Create new conversation
- `POST /api/chatbot/send/` - Send message to chatbot
- `PATCH /api/chatbot/conversations/{id}/end/` - End conversation
- `GET /api/chatbot/stats/` - Get chatbot statistics

## Usage

### Basic Integration
The ChatBot component is automatically included in the main App.tsx and will appear for authenticated users:

```tsx
import ChatBot from "./components/ChatBot";

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatBot />
    </div>
  );
}
```

### Using the Hook
You can use the chatbot hook in other components:

```tsx
import { useChatBot } from "@/hooks/useChatBot";

function MyComponent() {
  const {
    messages,
    isLoading,
    sendMessage,
    initializeChat,
    clearChat
  } = useChatBot();

  // Your component logic
}
```

### API Service Usage
Direct API calls can be made using the service:

```tsx
import { chatbotApiService } from "@/services/chatbotApi";

// Send a message
const response = await chatbotApiService.sendMessage({
  content: "Hello, I need help with plumbing",
  session_id: "optional-session-id"
});

// Get conversations
const conversations = await chatbotApiService.getConversations();
```

## Styling
The chatbot uses Tailwind CSS classes and custom CSS for styling. Key style features:

- Fixed positioning (bottom-right corner)
- Responsive design
- Smooth animations
- RTL support for Arabic text
- Dark mode compatibility

## Configuration
The chatbot can be configured through:

1. **API Base URL**: Update in `chatbotApi.ts`
2. **Styling**: Modify `chatbot.css` or Tailwind classes
3. **Behavior**: Adjust hook logic in `useChatBot.ts`

## Authentication
The chatbot requires user authentication:
- Only authenticated users can see the chatbot
- JWT tokens are automatically included in API requests
- Unauthenticated users won't see the chatbot interface

## Error Handling
The integration includes comprehensive error handling:
- Network errors are caught and displayed as toasts
- Failed messages are still shown to the user
- Loading states prevent multiple simultaneous requests
- Graceful degradation when API is unavailable

## Mobile Responsiveness
The chatbot is fully responsive:
- On mobile: Full-screen overlay
- On desktop: Fixed-size window
- Touch-friendly interface
- Proper keyboard handling

## Accessibility
The chatbot includes accessibility features:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- High contrast support

## Performance
Optimizations included:
- Lazy loading of messages
- Efficient re-renders with React hooks
- Minimal API calls
- Proper cleanup on unmount

## Troubleshooting

### Common Issues
1. **Chatbot not appearing**: Check if user is authenticated
2. **API errors**: Verify backend is running and endpoints are accessible
3. **Styling issues**: Ensure Tailwind CSS is properly configured
4. **TypeScript errors**: Check import paths and type definitions

### Debug Mode
Enable debug logging by adding to your environment:
```
REACT_APP_DEBUG_CHATBOT=true
```

## Future Enhancements
Potential improvements:
- Voice input/output
- File sharing capabilities
- Conversation search
- Message reactions
- Typing indicators
- Push notifications
- Offline support
- Multi-language support

## Dependencies
Required packages:
- React 18+
- Tailwind CSS
- Lucide React (icons)
- Sonner (toast notifications)
- Custom UI components (shadcn/ui)

## Backend Requirements
The frontend expects the backend to provide:
- JWT authentication
- RESTful chatbot API
- Proper CORS configuration
- Error response formatting
