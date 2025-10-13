# Trip Planner API Documentation

## Overview

The Trip Planner API provides comprehensive endpoints for managing group trips, participants, surveys, recommendations, and voting. The API is built with Express.js and uses PostgreSQL with Prisma ORM for data persistence.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

## Authentication

The API uses header-based authentication with the `X-User-Id` header containing a valid UUID. All endpoints except `/health` require authentication.

**Example:**
```bash
curl -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000" \
  http://localhost:3001/api/trips
```

## Authorization

- **Trip Organizers**: Can view, modify, and delete their own trips
- **Participants**: Can view trips they're invited to (future feature)
- **Public**: No access to trip data

## Response Format

All API responses follow a consistent JSON format:

```json
{
  "data": "...",
  "error": "Error message (if applicable)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (database issues)

## Endpoints

### Health Check

#### GET /health

Check the API and database health status.

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Trip Management

#### POST /trips

Create a new trip. The organizer ID is automatically set from the authenticated user.

**Headers:**
- `X-User-Id`: UUID of the trip organizer (required)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "name": "Trip to Tokyo"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Trip to Tokyo",
    "organizerId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "created",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "participants": []
  },
  "message": "Trip created successfully"
}
```

#### GET /trips/:id

Get detailed information about a specific trip. Only the trip organizer can access this endpoint.

**Headers:**
- `X-User-Id`: UUID of the requesting user (required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Trip to Tokyo",
    "organizerId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "created",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "participants": [
      {
        "id": "participant-uuid",
        "name": "John Doe",
        "phoneNumber": "+1234567890",
        "hasCompletedSurvey": false,
        "hasVoted": false,
        "surveyToken": "secure-token-here",
        "voteToken": "secure-token-here",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "stats": {
      "participantCount": 1,
      "surveyCompletionCount": 0,
      "voteCount": 0
    }
  }
}
```

#### PUT /trips/:id

Update trip details. Only the trip organizer can modify trips.

**Headers:**
- `X-User-Id`: UUID of the trip organizer (required)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "name": "Updated Trip Name",
  "status": "surveying"
}
```

**Valid Statuses:**
- `created` - Trip just created
- `surveying` - Collecting participant preferences
- `voting` - Participants voting on recommendations
- `completed` - Trip planning completed
- `cancelled` - Trip cancelled

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Updated Trip Name",
    "organizerId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "surveying",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "participants": []
  },
  "message": "Trip updated successfully"
}
```

### Participant Management

#### POST /trips/:id/participants

Add a participant to a trip. Only the trip organizer can add participants.

**Headers:**
- `X-User-Id`: UUID of the trip organizer (required)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "name": "John Doe",
  "phoneNumber": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "participant-uuid",
    "tripId": "trip-uuid",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "hasCompletedSurvey": false,
    "hasVoted": false,
    "surveyToken": "secure-survey-token",
    "voteToken": "secure-vote-token",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Participant added successfully"
}
```

#### GET /trips/:id/participants

Get all participants for a trip. Only the trip organizer can view participants.

**Headers:**
- `X-User-Id`: UUID of the trip organizer (required)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "participant-uuid",
      "tripId": "trip-uuid",
      "name": "John Doe",
      "phoneNumber": "+1234567890",
      "hasCompletedSurvey": false,
      "hasVoted": false,
      "surveyToken": "secure-survey-token",
      "voteToken": "secure-vote-token",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### DELETE /trips/:id/participants/:participantId

Remove a participant from a trip. Only the trip organizer can remove participants.

**Headers:**
- `X-User-Id`: UUID of the trip organizer (required)

**Response (200):**
```json
{
  "success": true,
  "message": "Participant removed successfully"
}
```

#### GET /trips/:id/recommendations

Get recommendations for a trip.

**Response:**
```json
{
  "recommendations": [
    {
      "id": "uuid-here",
      "destinationName": "Santorini, Greece",
      "destinationCountry": "Greece",
      "destinationRegion": "Mediterranean",
      "description": "Beautiful Greek island...",
      "imageUrl": "https://example.com/image.jpg",
      "matchScore": 0.92,
      "estimatedCostMin": 1400,
      "estimatedCostMax": 1900,
      "costCurrency": "USD",
      "bestTimeToVisit": "July - Perfect weather",
      "keyActivities": ["beach", "culture", "food"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /trips/:id/results

Get voting results for a trip.

**Response:**
```json
{
  "votes": [
    {
      "id": "uuid-here",
      "participantId": "participant-uuid",
      "rankings": [
        {"recommendationId": "rec-1", "rank": 1},
        {"recommendationId": "rec-2", "rank": 2}
      ],
      "submittedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "results": [
    {
      "id": "uuid-here",
      "winningRecommendationId": "rec-1",
      "roundsData": {...},
      "finalTally": {...},
      "calculatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Data Models

### Trip Status Flow

```
created → surveying → voting → completed
    ↓         ↓         ↓
cancelled  cancelled  cancelled
```

### Validation Rules

#### Trip Validation
- **Trip Name**: 1-255 characters, required, trimmed
- **Trip Status**: Must be one of: `created`, `surveying`, `voting`, `completed`, `cancelled`
- **Trip ID**: Must be valid UUID format

#### Participant Validation
- **Participant Name**: 1-255 characters, required, trimmed
- **Phone Number**: Must be in international format (e.g., +1234567890), 8-16 digits
- **Phone Number Uniqueness**: Each phone number can only be added once per trip

#### Authentication Validation
- **User ID**: Must be valid UUID format in `X-User-Id` header
- **Authorization**: Only trip organizers can access/modify their trips

## Rate Limiting

Currently no rate limiting is implemented. This will be added in future versions.

## Pagination

List endpoints support pagination with `limit` and `offset` parameters:
- Maximum limit: 100 items
- Default: Return all items
- Offset: 0-based indexing

## Error Examples

### Authentication Error (401)
```json
{
  "error": "Authentication required",
  "message": "Please provide X-User-Id header for authentication"
}
```

### Authorization Error (403)
```json
{
  "error": "Access denied",
  "message": "You are not authorized to view this trip"
}
```

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Trip name is required",
      "code": "invalid_type"
    }
  ]
}
```

### Duplicate Error (409)
```json
{
  "error": "Duplicate participant",
  "message": "A participant with this phone number already exists in this trip"
}
```

### Not Found (404)
```json
{
  "error": "Trip not found",
  "message": "The requested trip does not exist"
}
```

### Database Error (500)
```json
{
  "error": "Failed to create trip",
  "message": "Internal server error"
}
```

## Development

### Running the API

```bash
# Start with Docker (recommended)
./scripts/quick-start.sh

# Or manually
npm run dev
```

### Testing

```bash
# Run integration tests
npm test

# Manual API testing examples
# Health check
curl http://localhost:3001/health

# Create trip
curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{"name":"Test Trip"}'

# Get trip details
curl -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000" \
  http://localhost:3001/api/trips/TRIP_ID

# Add participant
curl -X POST http://localhost:3001/api/trips/TRIP_ID/participants \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{"name":"John Doe","phoneNumber":"+1234567890"}'
```

### Database

The API uses PostgreSQL with Prisma ORM. See [DATABASE.md](./DATABASE.md) for database documentation.

## Future Enhancements

- Authentication and authorization
- Rate limiting
- API versioning
- WebSocket support for real-time updates
- File upload for trip images
- Email notifications
- Advanced filtering and search