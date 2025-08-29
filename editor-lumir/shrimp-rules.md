# Development Guidelines

## Project Overview

- **Project**: Next.js + NextAuth.js 기반 문서 편집기
- **UI Framework**: shadcn UI + Tailwind CSS
- **Database**: MongoDB
- **Authentication**: NextAuth.js (JWT strategy)

## Code Standards

### UI Components

#### Loading States

- **MUST** use `Spinner` component for all loading states
- **PROHIBITED** from using text-based loading indicators
- **REQUIRED** to use appropriate spinner sizes:
  - `sm`: Small loading states (buttons, inline)
  - `md`: Default loading states (page sections)
  - `lg`: Large loading states (full page)

#### Loading State Implementation

```typescript
// ✅ CORRECT - Use Spinner component
import { Spinner } from '@/components/ui';

if (loading) {
  return (
    <div className='flex-1 flex items-center justify-center'>
      <Spinner size='md' />
    </div>
  );
}

// ❌ PROHIBITED - Text-based loading
if (loading) {
  return (
    <div className='flex-1 flex items-center justify-center'>
      <div className='text-gray-500'>로딩 중...</div>
    </div>
  );
}
```

#### Authentication Loading States

- **MUST** use `Spinner` for authentication status checks
- **REQUIRED** to show spinner during session validation
- **PROHIBITED** from showing text like "인증 상태 확인 중..."

#### Page Loading States

- **MUST** use `Spinner` for page content loading
- **REQUIRED** to show spinner during API calls
- **PROHIBITED** from showing text like "페이지 로딩 중..."

### Component Structure

#### File Organization

- **MUST** follow shadcn UI component structure
- **REQUIRED** to export components from `src/components/ui/index.ts`
- **MUST** use TypeScript interfaces for props

#### Styling

- **MUST** use Tailwind CSS exclusively
- **PROHIBITED** from using separate CSS files
- **REQUIRED** to use `cn()` utility for conditional classes

### Authentication Implementation

#### Middleware Protection

- **MUST** protect all routes except public paths
- **REQUIRED** to return 401 for unauthenticated API requests
- **REQUIRED** to redirect to `/signin` for unauthenticated page requests

#### Client-side Authentication

- **MUST** use `useSession()` for authentication state
- **REQUIRED** to check authentication before API calls
- **PROHIBITED** from making API calls without authentication check

## Functionality Implementation Standards

### Loading State Management

- **MUST** implement loading states for all async operations
- **REQUIRED** to use `Spinner` component consistently
- **MUST** handle loading, error, and success states

### Error Handling

- **MUST** implement proper error boundaries
- **REQUIRED** to show user-friendly error messages
- **PROHIBITED** from showing raw error objects to users

## Framework Usage Standards

### NextAuth.js

- **MUST** use JWT strategy for sessions
- **REQUIRED** to implement proper session management
- **MUST** handle authentication redirects properly

### shadcn UI

- **MUST** use existing shadcn UI components
- **REQUIRED** to follow shadcn UI patterns
- **PROHIBITED** from creating custom components that duplicate shadcn UI functionality

## Key File Interaction Standards

### Loading State Updates

When updating loading states:

- **MUST** update `src/components/ui/spinner.tsx` if spinner design changes
- **REQUIRED** to update `src/components/ui/index.ts` for exports
- **MUST** update all components using text-based loading states

### Authentication Updates

When updating authentication:

- **MUST** update `src/lib/auth/auth.ts` for NextAuth.js configuration
- **REQUIRED** to update `middleware.ts` for route protection
- **MUST** update client components using `useSession()`

## AI Decision-making Standards

### Loading State Decisions

1. **Check existing loading states** in the component
2. **Replace text-based loading** with `Spinner` component
3. **Choose appropriate spinner size** based on context
4. **Maintain consistent styling** with existing components

### Component Modification Priority

1. **High Priority**: Authentication and security-related changes
2. **Medium Priority**: UI/UX improvements and loading states
3. **Low Priority**: Cosmetic changes and optimizations

## Prohibited Actions

### UI/UX

- **PROHIBITED** from using text-based loading indicators
- **PROHIBITED** from creating custom loading components
- **PROHIBITED** from using external loading libraries
- **PROHIBITED** from using CSS animations for loading states

### Authentication

- **PROHIBITED** from bypassing middleware protection
- **PROHIBITED** from making unauthenticated API calls
- **PROHIBITED** from storing sensitive data in client-side state

### Code Quality

- **PROHIBITED** from using `any` type without proper justification
- **PROHIBITED** from creating components without TypeScript interfaces
- **PROHIBITED** from using inline styles instead of Tailwind CSS
