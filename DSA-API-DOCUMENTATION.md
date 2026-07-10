# DSA Module API Documentation & Frontend Implementation Guide

## 🎯 Overview
Complete DSA (Data Structures & Algorithms) learning system with AI-powered analysis, spaced repetition, and pattern-wise problem tracking.

## 📡 API Endpoints

### Base URL: `/api/dsa`
**Authentication**: All endpoints require JWT token in Authorization header

---

## 🔥 Core CRUD Operations

### 1. Create Problem
```http
POST /api/dsa/problems
```

**Request Body:**
```json
{
  "title": "Two Sum",
  "leetcodeUrl": "https://leetcode.com/problems/two-sum/",
  "leetcodeNumber": 1,
  "difficulty": "Easy",
  "pattern": "Hash Map",
  "subPattern": "Key-Value Pairs",
  "confidence": 3,
  "code": "function twoSum(nums, target) { ... }",
  "language": "JavaScript",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "DSA problem created successfully",
  "data": {
    "problem": { /* Full problem object */ },
    "revisionSchedule": ["2024-01-02", "2024-01-04", "2024-01-08", "2024-01-15"]
  }
}
```

---

### 2. Get All Problems
```http
GET /api/dsa/problems?pattern=Hash%20Map&difficulty=Easy&status=active
```

**Query Parameters:**
- `pattern` (optional) - Filter by pattern
- `difficulty` (optional) - Filter by difficulty (Easy/Medium/Hard)
- `status` (optional) - Filter by status (active/mastered/archived)

**Response:**
```json
{
  "success": true,
  "message": "DSA problems fetched successfully",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "title": "Two Sum",
      "leetcodeNumber": 1,
      "leetcodeUrl": "https://leetcode.com/problems/two-sum/",
      "difficulty": "Easy",
      "pattern": "Hash Map",
      "subPattern": "Key-Value Pairs",
      "confidence": 3,
      "nextRevisionDate": "2024-01-02T00:00:00.000Z",
      "status": "active",
      "solvedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Problem
```http
GET /api/dsa/problems/:id
```

**Response:** Full problem object with all details including:
- Code solution
- AI-generated insights
- Revision history
- Similar problems

---

### 4. Update Problem
```http
PUT /api/dsa/problems/:id
```

**Request Body:** Any updatable fields
```json
{
  "title": "Updated Two Sum",
  "confidence": 4,
  "code": "function twoSum(nums, target) { /* updated code */ }"
}
```

---

### 5. Delete Problem
```http
DELETE /api/dsa/problems/:id
```

---

## 🔄 Revision System

### 6. Mark Problem as Revised
```http
POST /api/dsa/problems/:id/revise
```

**Request Body:**
```json
{
  "confidence": 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "Revision updated successfully",
  "data": {
    "problem": { /* Updated problem with new revision stage */ },
    "revisionSchedule": ["2024-01-08", "2024-01-15", "2024-01-22", "2024-02-01"]
  }
}
```

---

### 7. Get Due Today Problems
```http
GET /api/dsa/due-today
```

**Response:** Array of problems due for revision today

---

## 📊 Analytics & Dashboard

### 8. Get Pattern Statistics
```http
GET /api/dsa/patterns
```

**Response:**
```json
{
  "success": true,
  "message": "Pattern stats fetched successfully",
  "data": [
    {
      "pattern": "Hash Map",
      "solved": 15,
      "avgConfidence": 3.2,
      "mastery": "Strong"
    },
    {
      "pattern": "Two Pointers",
      "solved": 8,
      "avgConfidence": 2.7,
      "mastery": "Moderate"
    }
  ]
}
```

---

### 9. Get Dashboard Data
```http
GET /api/dsa/dashboard
```

**Response:**
```json
{
  "success": true,
  "message": "DSA dashboard fetched successfully",
  "data": {
    "streak": {
      "current": 7,
      "longest": 15,
      "todayDone": true
    },
    "dueToday": [ /* Problems due today */ ],
    "patternMastery": [ /* Pattern statistics */ ],
    "totalSolved": 45,
    "totalMastered": 12,
    "weeklyActivity": [
      { "_id": "2024-01-01", "revisions": 3 },
      { "_id": "2024-01-02", "revisions": 5 }
    ]
  }
}
```

---

## 🔍 Search

### 10. Search by LeetCode Number
```http
GET /api/dsa/search?leetcodeNumber=167
```

**Response:** Array of problems matching the LeetCode number

---

## 🤖 AI Analysis

### 11. Analyze Problem (Only - No Save)
```http
POST /api/dsa/analyze
```

**Request Body:**
```json
{
  "problemName": "Two Sum",
  "leetcodeUrl": "https://leetcode.com/problems/two-sum/",
  "code": "function twoSum(nums, target) { ... }",
  "language": "JavaScript",
  "felt": "Confident",
  "confidence": 3
}
```

**Response:** AI-generated analysis (same as below but not saved)

---

### 12. Analyze and Save (One-Shot) ⭐
```http
POST /api/dsa/analyze-and-save
```

**Request Body:** Same as analyze endpoint

**Response:**
```json
{
  "success": true,
  "message": "Problem analyzed and saved successfully",
  "data": {
    "pattern": "Hash Map",
    "subPattern": "Key-Value Pairs",
    "triggerSentence": "Main isko Hash Map isliye pehchanunga kyunki hume pairs find karne hain",
    "bruteForce": "Nested loops O(n²) - har element ke saath har element check karo",
    "whyOptimal": "Hash map se O(n) - ek pass mein store karke second pass mein complement check karo",
    "weakPoint": "Edge cases handle karna jab duplicate values hon",
    "revisionNote": "Hash map usage ki practice karo, complement logic clear rakho",
    "commonMistakes": [
      "Same element ko use kar lena",
      "Empty array handle nahi karna",
      "Multiple solutions ko handle nahi karna"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "similarProblems": [
      {
        "title": "3Sum",
        "url": "https://leetcode.com/problems/3sum/",
        "difficulty": "Medium",
        "whySimilar": "Hash map se triplet find karna"
      }
    ]
  }
}
```

---

## 📋 Data Models

### DSA Problem Object
```typescript
interface DSAProblem {
  _id: string;
  userId: string;
  title: string;
  leetcodeNumber?: number;
  leetcodeUrl: string;
  difficulty: "Easy" | "Medium" | "Hard";
  
  // Pattern Information
  pattern: string;
  subPattern: string;
  triggerSentence: string;
  
  // Solution Details
  code: string;
  language: string;
  timeComplexity: string;
  spaceComplexity: string;
  
  // AI Insights
  bruteForce: string;
  whyOptimal: string;
  weakPoint: string;
  revisionNote: string;
  commonMistakes: string[];
  similarProblems: SimilarProblem[];
  
  // Revision System
  confidence: 1 | 2 | 3 | 4;  // 1=Low, 4=High
  revisionStage: 0 | 1 | 2 | 3 | 4;
  nextRevisionDate: Date;
  lastRevisedAt?: Date;
  revisionHistory: RevisionEntry[];
  
  // Metadata
  status: "active" | "mastered" | "archived";
  solvedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Similar Problem
```typescript
interface SimilarProblem {
  title: string;
  url: string;
  difficulty: "Easy" | "Medium" | "Hard";
  whySimilar: string;
}
```

### Revision Entry
```typescript
interface RevisionEntry {
  revisedAt: Date;
  confidence: 1 | 2 | 3 | 4;
  revisionStage: number;
}
```

---

## 🎨 Frontend Implementation Guide

### 1. Dashboard Page
**Components Needed:**
- Streak counter with fire emoji 🔥
- Due today problems card
- Pattern mastery chart (bar chart)
- Weekly activity heatmap
- Quick stats cards

**Key Features:**
- Real-time streak tracking
- Visual progress indicators
- Quick action buttons for revision

### 2. Problems List Page
**Features:**
- Filter by pattern, difficulty, status
- Sort by date, confidence, next revision
- Search functionality
- Pagination
- Bulk actions (mark revised, archive)

**UI Elements:**
- Problem cards with key info
- Confidence indicators (1-4 stars)
- Next revision date badges
- Status color coding

### 3. Problem Detail Page
**Sections:**
- Problem info (title, LeetCode link, difficulty)
- Code solution with syntax highlighting
- AI insights (pattern, approach, mistakes)
- Revision history timeline
- Similar problems suggestions

**Interactions:**
- Edit problem
- Mark as revised
- View on LeetCode
- Copy code

### 4. Add Problem Page
**Two Options:**
1. **Manual Entry**: Form with all fields
2. **AI Analysis**: Paste code + problem URL → Auto-analyze

**Smart Features:**
- LeetCode URL parsing
- Auto-detect language
- AI-powered pattern detection
- Real-time validation

### 5. Pattern Analytics Page
**Visualizations:**
- Pattern distribution pie chart
- Confidence heatmap by pattern
- Progress over time
- Mastery levels

### 6. Revision Queue
**Daily Review Interface:**
- Today's problems list
- Quick revision mode
- Confidence rating
- Mark complete
- Skip for later

---

## 🎯 UI/UX Best Practices

### Color Coding
- **Green**: Mastered/High confidence
- **Blue**: Active/Medium confidence  
- **Orange**: Due today/Low confidence
- **Red**: Overdue

### Micro-interactions
- Confidence star ratings
- Smooth transitions
- Loading states
- Success animations

### Mobile Responsiveness
- Swipe actions on problem cards
- Bottom navigation
- Quick add FAB
- Touch-friendly buttons

---

## 🚀 Implementation Priority

### Phase 1: Core Features
1. Dashboard with streak
2. Problems list with filters
3. Add problem (manual + AI)
4. Problem detail view

### Phase 2: Advanced Features
1. Revision queue
2. Pattern analytics
3. Search functionality
4. Bulk operations

### Phase 3: Enhancements
1. Export/import data
2. Advanced analytics
3. Social features
4. Mobile app

---

## 📱 Component Library Suggestions

**React Components:**
- `Dashboard` - Main dashboard
- `ProblemCard` - Problem list item
- `ProblemForm` - Add/edit problem
- `PatternChart` - Pattern statistics
- `RevisionQueue` - Daily review
- `ConfidenceStars` - Confidence rating
- `CodeEditor` - Code display/edit

**State Management:**
- Problems state
- User preferences
- Revision queue
- Analytics data

---

## 🔧 Technical Notes

### API Integration
- Use axios/fetch for API calls
- Implement retry logic for AI endpoints
- Cache dashboard data
- Handle offline scenarios

### Error Handling
- User-friendly error messages
- Retry mechanisms
- Fallback UI states
- Progress indicators

### Performance
- Lazy load problem lists
- Virtual scrolling for large lists
- Debounced search
- Image optimization for charts

---

## 🎯 Success Metrics

### User Engagement
- Daily streak maintenance
- Revision completion rate
- Pattern coverage
- Time spent on platform

### Learning Outcomes
- Confidence improvement
- Pattern mastery progression
- Problem-solving speed
- Retention rate

This documentation provides everything needed to build a comprehensive DSA learning frontend with excellent UX! 🚀
