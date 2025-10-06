# Trip Planner API Documentation

## Overview

The Trip Planner API provides endpoints for managing group trips, participants, surveys, recommendations, and voting. The API is built with Express.js and uses PostgreSQL with Prisma ORM for data persistence.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Currently, the API does not require authentication. This will be added in future versions.

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

### Trips

#### GET /trips

List all trips with pagination support.

**Query Parameters:**
- `limit` (optional): Number of trips to return (1-100, default: all)
- `offset` (optional): Number of trips to skip (default: 0)

**Example Request:**
```bash
curl "http://localhost:3001/api/trips?limit=10&offset=0"
```

**Response:**
```json
{
  "trips": [
    {
      "id": "uuid-here",
      "name": "Summer Europe Adventure",
      "organizerId": "org-123",
      "status": "created",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "participantCount": 3,
      "surveyResponseCount": 2,
      "recommendationCount": 0,
      "voteCount": 0
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

#### POST /trips

Create a new trip.

**Request Body:**
```json
{
  "name": "Trip Name",
  "organizerId": "organizer-id"
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "name": "Trip Name",
  "organizerId": "organizer-id",
  "status": "created",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### GET /trips/:id

Get detailed information about a specific trip.

**Response:**
```json
{
  "id": "uuid-here",
  "name": "Summer Europe Adventure",
  "organizerId": "org-123",
  "status": "created",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "participants": [
    {
      "id": "participant-uuid",
      "name": "Alice Johnson",
      "phoneNumber": "+1234567890",
      "hasCompletedSurvey": false,
      "hasVoted": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "surveyResponses": [],
  "recommendations": [],
  "votes": [],
  "votingResults": []
}
```

#### PUT /trips/:id/status

Update the status of a trip.

**Request Body:**
```json
{
  "status": "surveying"
}
```

**Valid Statuses:**
- `created` - Trip just created
- `surveying` - Collecting participant preferences
- `voting` - Participants voting on recommendations
- `completed` - Trip planning completed
- `cancelled` - Trip cancelled

**Response:**
```json
{
  "id": "uuid-here",
  "name": "Trip Name",
  "organizerId": "organizer-id",
  "status": "surveying",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### DELETE /trips/:id

Delete a trip and all associated data.

**Response:** `204 No Content`

#### GET /trips/:id/stats

Get statistics for a specific trip.

**Response:**
```json
{
  "participantCount": 3,
  "surveyResponseCount": 2,
  "recommendationCount": 5,
  "voteCount": 2,
  "completionRate": 66.67,
  "votingRate": 66.67
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

- **Trip Name**: 1-255 characters, required
- **Organizer ID**: Non-empty string, required
- **Trip ID**: Must be valid UUID
- **Status**: Must be one of the valid status values

## Rate Limiting

Currently no rate limiting is implemented. This will be added in future versions.

## Pagination

List endpoints support pagination with `limit` and `offset` parameters:
- Maximum limit: 100 items
- Default: Return all items
- Offset: 0-based indexing

## Error Examples

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name is required and must be 1-255 characters"
    }
  ]
}
```

### Not Found (404)
```json
{
  "error": "Trip not found"
}
```

### Database Error (500)
```json
{
  "error": "Database connection failed"
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
# Test all endpoints
./scripts/test-trips-api.sh

# Manual testing
curl http://localhost:3001/api/trips
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