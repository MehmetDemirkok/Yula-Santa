You are a senior full-stack developer.

I want to build a New Year gift lottery (Secret Santa) website using Next.js (App Router).
The project will be developed inside Antigravity IDE.

GOALS:
- Users can create a New Year lottery.
- Users enter participant names.
- The system randomly assigns each person another person to buy a gift for (Secret Santa logic).
- No one can draw themselves.
- Each participant can see only their own result.
- After the draw, AI-powered New Year themed gift suggestions are shown.

TECH STACK:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- OpenAI / AI text generation (prompt-based gift suggestion)
- No authentication in v1 (simple usage)
- No database for MVP (use memory or localStorage)

PAGES:
1. Home Page
   - Title: "Yılbaşı Hediye Çekilişi"
   - Input to add participant names
   - Button: "İsim Ekle"
   - List of added names
   - Button: "Çekilişi Yap"

2. Draw Result Page
   - User selects their own name
   - System reveals only who they should buy a gift for
   - Festive New Year UI (red, green, white tones)
   - Friendly, joyful copywriting

3. AI Gift Suggestion Section
   - Appears after draw result
   - Uses AI to generate personalized gift suggestions
   - Input parameters for AI:
     - Receiver gender (optional)
     - Budget range (optional)
     - Relationship type (friend, partner, coworker, family)
   - AI should return:
     - 3–5 gift ideas
     - Short explanation for each idea
   - Suggestions must be New Year themed

AI REQUIREMENTS:
- Implement a server-side API route for AI gift suggestions
- Prompt engineering:
     - System prompt: "You are a creative New Year gift expert"
     - User prompt should include budget, relationship, and New Year context
- Fallback to predefined gift list if AI fails

FUNCTIONAL REQUIREMENTS:
- Use a proper shuffle algorithm (Fisher–Yates)
- Prevent self-assignment
- Clear separation of logic and UI
- Reusable components
- Clean and readable code with comments

UI/UX:
- Responsive design
- Festive New Year atmosphere
- Smooth animations and transitions
- No external UI libraries (Tailwind only)

OUTPUT EXPECTATION:
- Generate full Next.js project structure
- Implement all pages step by step
- Create AI API route with example prompts
- Explain key logic parts
- Focus on MVP first, extensible later

Start by generating the project structure and Home Page.
