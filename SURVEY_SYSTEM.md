# Survey Management System

This document describes the survey management system implemented for the Group Trip Planner application.

## Overview

The survey management system allows trip organizers to collect travel preferences from participants through secure, tokenized survey links. The system handles survey distribution, response collection, validation, and progress tracking.

## Features

### Core Functionality
- **Secure Survey Access**: Token-based authentication for survey access
- **Comprehensive Data Collection**: Budget, dates, destinations, travel vibe, and notes
- **Real-time Progress Tracking**: Monitor survey completion status
- **Automated SMS Distribution**: Send survey links via SMS (placeholder implementation)
- **Data Validation**: Robust validation of survey responses
- **Trip Status Management**: Automatic trip status updates based on survey progress

### API Endpoints

#### Public Survey Endpoints (No Authentication Required)
- `GET /api/surveys/:token` - Get survey form for participant
- `POST /api/surveys/:token` - Submit survey response

#### Authenticated Trip Management Endpoints
- `POST /api/trips/:id/surveys/send` - Send survey invitations to all participants
- `GET /api/trips/:id/survey-status` - Get survey completion status

## Data Models

### Survey Response
```typescript
interface SurveyResponse {
  id: string;
  participantId: string;
  tripId: string;
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  availableDates: {
    startDate: Date;
    endDate: Date;
    flexibility: 'fixed' | 'flexible' | 'very-flexible';
  };
  destinationPreferences: {
    regions: string[];
    climatePreference: string;
    activityTypes: string[];
    accommodationStyle: string;
  };
  travelVibe: string;
  additionalNotes?: string;
  submittedAt: Date;
}
```

## Security Features

### Token-Based Access
- Each participant receives a unique, secure survey token
- Tokens are 64-character hexadecimal strings generated using cryptographic randomness
- Tokens are single-use and tied to specific participants and trips

### Data Validation
- Comprehensive Zod schema validation for all survey data
- Budget range validation with reasonable limits
- Date validation with proper ordering constraints
- Required field validation for critical data

### Authorization
- Survey submission requires valid token
- Trip management requires organizer authentication
- Proper error handling for unauthorized access

## Database Schema

The survey system uses the following database tables:

### Participants Table
- Stores survey tokens for secure access
- Tracks survey completion status
- Links participants to trips

### Survey Responses Table
- Stores all survey response data
- Normalized structure for efficient querying
- Timestamps for audit trails

## Usage Examples

### Getting Survey Form
```bash
curl -X GET "http://localhost:3001/api/surveys/abc123token"
```

### Submitting Survey Response
```bash
curl -X POST "http://localhost:3001/api/surveys/abc123token" \
  -H "Content-Type: application/json" \
  -d '{
    "budgetRange": {
      "min": 1000,
      "max": 2000,
      "currency": "USD"
    },
    "availableDates": {
      "startDate": "2025-06-01T00:00:00.000Z",
      "endDate": "2025-06-15T00:00:00.000Z",
      "flexibility": "flexible"
    },
    "destinationPreferences": {
      "regions": ["Europe", "Asia"],
      "climatePreference": "temperate",
      "activityTypes": ["sightseeing", "culture"],
      "accommodationStyle": "hotel"
    },
    "travelVibe": "relaxed exploration",
    "additionalNotes": "Looking forward to this trip!"
  }'
```

### Sending Survey Invitations
```bash
curl -X POST "http://localhost:3001/api/trips/trip-id/surveys/send" \
  -H "X-User-Id: organizer-id"
```

### Checking Survey Status
```bash
curl -X GET "http://localhost:3001/api/trips/trip-id/survey-status" \
  -H "X-User-Id: organizer-id"
```

## Testing

The survey system includes comprehensive integration tests covering:

- Survey form retrieval and validation
- Survey response submission and validation
- Token-based security
- Survey invitation distribution
- Progress tracking and status reporting
- Error handling and edge cases

Run tests with:
```bash
cd backend
npm test -- --testPathPatterns=survey-integration.test.ts
```

## SMS Integration

The current implementation includes a placeholder SMS service that logs messages to the console. To integrate with a real SMS provider:

1. Update the `sendSurveyInvitations` method in `surveyService.ts`
2. Add SMS provider credentials to environment variables
3. Implement actual SMS sending logic
4. Add error handling for SMS delivery failures

## Future Enhancements

- Real SMS integration with providers like Twilio or AWS SNS
- Email survey distribution as an alternative to SMS
- Survey reminder functionality
- Custom survey questions per trip
- Survey response analytics and insights
- Bulk survey operations
- Survey expiration dates

## Error Handling

The system provides comprehensive error handling for:

- Invalid or expired survey tokens
- Duplicate survey submissions
- Validation errors with detailed field-level feedback
- Database connection issues
- Authorization failures
- Malformed request data

All errors return appropriate HTTP status codes and descriptive error messages to help with debugging and user experience.