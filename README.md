## Lightwork Backend API

### Project Description

A backend API service for managing doctor appointments and scheduling. Built with Node.js, Express, and PostgreSQL (via Prisma ORM).

It provides:

- Doctor profile management
- Flexible appointment slot creation with:
  - One-time slots
  - Weekly recurring slots
  - Monthly recurring slots
  - Configurable slot durations (15 or 30 minutes)
- Appointment booking system
- Availability checking
- Date range based booking queries

Key Features:

- RESTful API design
- Docker containerization for easy deployment
- Automated database migrations
- Efficient slot generation based on recurrence rules
- Conflict-free booking with database constraints
- UTC timestamp handling for timezone safety

Tech Stack:

- Node.js/Express
- PostgreSQL
- Prisma ORM
- Docker & Docker Compose
- TypeScript
- Zod for input validation

### Routes

- POST `/api/doctor`
  To add new doctor.

  Example curl:

  ```curl
  curl --request POST \
  --url http://localhost:3000/api/doctor \
  --header 'Content-Type: application/json' \
  --data '{
  "username": "drsmith",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@clinic.com"
  }'
  ```

  Response body:

  ```json
  {
    "data": {
      "id": "f20371f6-bfe1-4de7-b91b-5c8a4444c087",
      "username": "drsmith",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@clinic.com",
      "createdAt": "2025-03-03T18:34:21.672Z",
      "updatedAt": "2025-03-03T18:34:21.672Z"
    },
    "message": "Doctor created"
  }
  ```

- POST `/api/doctor/:doctorId/slots`
  To add new slot(s) for a doctor.

  Example curl:

  ```
  curl --request POST \
  --url http://localhost:3000/api/doctor/f20371f6-bfe1-4de7-b91b-5c8a4444c087/slots \
  --header 'Content-Type: application/json' \
  --data '{
      "startTime": "2024-03-04T10:00:00Z",
      "endTime": "2024-03-04T11:30:00Z",
      "slotDuration": 30,
      "repeatType": "WEEKLY",
      "daysOfWeek": 10,
      "endDate": "2024-12-31T23:59:59Z"
  }'
  ```

  Response body:

  ```json
  {
    "message": "Slots created",
    "recurrenceRuleId": "45c99cd6-1672-4d14-a51d-875cd300f2e7",
    "createdSlots": 15
  }
  ```

- GET `/api/doctor/:doctorId/bookings`
  To get all booking for a doctor.

  Example curl:

  ```curl
  curl --request GET \
  --url 'http://localhost:3000/api/doctor/900f5091-af5a-4187-9ef7-e440a5c9b55b/bookings?startDate=2020-03-03&endDate=2029-03-07'
  ```

  Response body:

  ```json
  {
    "data": [
      {
        "id": "a3654568-9da5-4347-aa55-59441785a5c4",
        "slotId": "17e3a6a6-cf65-46c9-aa40-834d778e18ca",
        "reason": "headache",
        "createdAt": "2025-03-03T18:52:11.808Z",
        "updatedAt": "2025-03-03T18:52:11.808Z",
        "slot": {
          "id": "17e3a6a6-cf65-46c9-aa40-834d778e18ca",
          "doctorId": "900f5091-af5a-4187-9ef7-e440a5c9b55b",
          "startTime": "2024-06-12T10:30:00.000Z",
          "endTime": "2024-06-12T10:45:00.000Z",
          "recurrenceId": "8d0e8b2b-874f-4ed8-87fc-b2278de75f5e",
          "slotDuration": 15,
          "createdAt": "2025-03-03T18:27:40.517Z",
          "updatedAt": "2025-03-03T18:27:40.517Z"
        }
      }
    ]
  }
  ```

- GET `/api/doctor/:doctorId/available_slots`
  To get all available slots for a doctor.

  Example curl:

  ```
  curl --request GET \
  --url 'http://localhost:3000/api/doctor/900f5091-af5a-4187-9ef7-e440a5c9b55b/available_slots?date=2024-06-12&slotDuration=15' \
  --header 'Content-Type: application/json'
  ```

  Response body:

  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "91ccb30d-4e0a-43e0-88d4-1404a3c47377",
        "doctorId": "900f5091-af5a-4187-9ef7-e440a5c9b55b",
        "startTime": "2024-06-12T10:00:00.000Z",
        "endTime": "2024-06-12T10:15:00.000Z",
        "recurrenceId": "8d0e8b2b-874f-4ed8-87fc-b2278de75f5e",
        "slotDuration": 15,
        "createdAt": "2025-03-03T18:27:40.517Z",
        "updatedAt": "2025-03-03T18:27:40.517Z"
      },
      {
        "id": "f0b70fc8-68ae-4451-8d0d-ac6c6bc214f7",
        "doctorId": "900f5091-af5a-4187-9ef7-e440a5c9b55b",
        "startTime": "2024-06-12T10:15:00.000Z",
        "endTime": "2024-06-12T10:30:00.000Z",
        "recurrenceId": "8d0e8b2b-874f-4ed8-87fc-b2278de75f5e",
        "slotDuration": 15,
        "createdAt": "2025-03-03T18:27:40.517Z",
        "updatedAt": "2025-03-03T18:27:40.517Z"
      },
      {
        "id": "17e3a6a6-cf65-46c9-aa40-834d778e18ca",
        "doctorId": "900f5091-af5a-4187-9ef7-e440a5c9b55b",
        "startTime": "2024-06-12T10:30:00.000Z",
        "endTime": "2024-06-12T10:45:00.000Z",
        "recurrenceId": "8d0e8b2b-874f-4ed8-87fc-b2278de75f5e",
        "slotDuration": 15,
        "createdAt": "2025-03-03T18:27:40.517Z",
        "updatedAt": "2025-03-03T18:27:40.517Z"
      },
      {
        "id": "015f32cf-213e-4f06-8a76-215f850184f2",
        "doctorId": "900f5091-af5a-4187-9ef7-e440a5c9b55b",
        "startTime": "2024-06-12T10:45:00.000Z",
        "endTime": "2024-06-12T11:00:00.000Z",
        "recurrenceId": "8d0e8b2b-874f-4ed8-87fc-b2278de75f5e",
        "slotDuration": 15,
        "createdAt": "2025-03-03T18:27:40.517Z",
        "updatedAt": "2025-03-03T18:27:40.517Z"
      },
      {
        "id": "c37fab32-d8be-41a7-91ef-39afd7d754f5",
        "doctorId": "900f5091-af5a-4187-9ef7-e440a5c9b55b",
        "startTime": "2024-06-12T11:00:00.000Z",
        "endTime": "2024-06-12T11:15:00.000Z",
        "recurrenceId": "8d0e8b2b-874f-4ed8-87fc-b2278de75f5e",
        "slotDuration": 15,
        "createdAt": "2025-03-03T18:27:40.517Z",
        "updatedAt": "2025-03-03T18:27:40.517Z"
      },
      {
        "id": "31c1105a-dfa3-4552-a17a-fef402e2b1b3",
        "doctorId": "900f5091-af5a-4187-9ef7-e440a5c9b55b",
        "startTime": "2024-06-12T11:15:00.000Z",
        "endTime": "2024-06-12T11:30:00.000Z",
        "recurrenceId": "8d0e8b2b-874f-4ed8-87fc-b2278de75f5e",
        "slotDuration": 15,
        "createdAt": "2025-03-03T18:27:40.517Z",
        "updatedAt": "2025-03-03T18:27:40.517Z"
      }
    ]
  }
  ```

- POST `/api/slot/:slotId/book`
  To book a slot.

  Example curl:

  ```curl
  curl --request POST \
  --url http://localhost:3000/api/slot/17e3a6a6-cf65-46c9-aa40-834d778e18ca/book \
  --header 'Content-Type: application/json' \
  --data '{
  "reason": "headache"
  }'
  ```

  Response body:

  ```json
  {
    "status": "success",
    "message": "Slot booked successfully",
    "data": {
      "id": "a3654568-9da5-4347-aa55-59441785a5c4",
      "slotId": "17e3a6a6-cf65-46c9-aa40-834d778e18ca",
      "reason": "headache",
      "createdAt": "2025-03-03T18:52:11.808Z",
      "updatedAt": "2025-03-03T18:52:11.808Z"
    }
  }
  ```

### Setup Guides

#### Clone the repo

```bash
git clone https://github.com/zeus-12/lightwork.git
```

#### Install dependencies (Optional)

```bash
cd lightwork
bun install
```

#### Run docker-compose

```bash
docker-compose up build
```
