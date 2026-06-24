# AI-Based Traffic Sign Detection, Localization and Map Dashboard System

## 1. Project Overview

This project is a web-based traffic sign mapping platform that connects field camera devices, an external computer vision model API, geolocation data, and an interactive dashboard.

The system captures images from cameras mounted on vehicles or user devices, sends the captured frames to an external AI model server, receives detected traffic sign results, combines those detections with the device's GPS location, stores all detection events and logs in Supabase, and visualizes verified traffic signs on a map dashboard.

The core value of this project is not only traffic sign detection. The main value is transforming raw AI detections into a structured, location-aware, reviewable, and map-ready traffic sign inventory.

---

## 2. Main System Goals

The system must support the following goals:

1. Authenticate users and admins.
2. Allow field users to start and stop a detection session.
3. Access browser/device camera and geolocation data.
4. Capture image frames periodically during an active session.
5. Send image frames and metadata to the backend.
6. Forward images to an external AI model API.
7. Store AI model responses and raw logs in Supabase.
8. Store device location logs for field-device tracking.
9. Group repeated detections into optimized traffic sign records.
10. Visualize static traffic signs on a map dashboard.
11. Optionally visualize active field devices on a separate live/polling map.
12. Provide admin pages for logs, devices, sessions, AI responses, and review workflows.

---

## 3. Recommended Technical Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui or Material UI
- Leaflet + OpenStreetMap for MVP map integration
- Optional: Mapbox GL for a more polished map experience
- Supabase client
- React Query or SWR for data fetching

### Backend Layer

- Next.js API Routes or Route Handlers
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Row Level Security
- External AI model API integration

### AI Model Server

The AI model is not developed inside this project. It is treated as an external API service.

Expected responsibility of the external AI service:

- Receive an image or image URL.
- Run traffic sign detection.
- Return detected sign class, confidence, bounding box, and processing metadata.

---

## 4. High-Level Architecture

```text
Field User / Vehicle Device
        |
        | Camera frame + GPS location
        v
Next.js Web Application
        |
        | API request with image + metadata
        v
Next.js API Route / Backend Gateway
        |
        | Store image
        v
Supabase Storage
        |
        | Image URL sent to AI service
        v
External AI Model API
        |
        | Detection result response
        v
Next.js API Route / Backend Gateway
        |
        | Save event, logs, observations
        v
Supabase PostgreSQL
        |
        | Query data
        v
Dashboard, Static Sign Map, Live Device Map, Admin Logs
```

---

## 5. Core User Roles

### 5.1 Field User

A field user operates a mobile device, vehicle-mounted camera, dashcam, or test device.

Permissions:

- Log in.
- Start a detection session.
- Stop a detection session.
- Allow camera access.
- Allow geolocation access.
- View their own detection sessions and map results.

### 5.2 Admin

An admin manages the system and analyzes collected data.

Permissions:

- View all users.
- View all devices.
- View all sessions.
- View all detection logs.
- Review and verify/reject detections.
- Monitor AI model responses.
- View device location history.
- Export detection data if implemented.

### 5.3 External AI Service

The AI model server receives images and returns traffic sign detections.

Responsibilities:

- Process image input.
- Return class ID, class name, confidence, bounding box, and processing time.
- It should not own the main application database logic.

---

## 6. Main Frontend Pages

### 6.1 Login Page

Purpose:

- Authenticate users with Supabase Auth.

Features:

- Email/password login.
- Error handling.
- Redirect to dashboard after successful login.
- Role-aware navigation after login.

---

### 6.2 Main Dashboard

Purpose:

- Provide a quick overview of the system.

Recommended widgets:

- Total detected traffic signs.
- Today’s detection count.
- Active devices.
- Active sessions.
- Low-confidence detections.
- Recent detections.
- Latest AI model response time.
- Small map preview or summary panel.

---

### 6.3 Detection Session Page

Purpose:

- Start and stop real detection sessions using camera and GPS.

Features:

- Start Detection button.
- Stop Detection button.
- Camera preview.
- Location permission status.
- Camera permission status.
- Current GPS latitude/longitude.
- Current GPS accuracy.
- Current session duration.
- Last AI response preview.
- Upload/detection status indicator.

MVP behavior:

- Real-time video streaming is not required.
- Capture one frame every 1 to 3 seconds during an active session.
- Send the frame and current GPS metadata to the backend.
- Store the result returned by the AI model.

---

### 6.4 Static Traffic Sign Map

Purpose:

- Show optimized/static traffic sign locations.

Important rule:

- This map should display final traffic sign inventory records, not every raw detection event.

Features:

- Map markers for traffic signs.
- Marker clustering if needed.
- Filter by sign type.
- Filter by confidence.
- Filter by verification status.
- Filter by date range.
- Marker popup with details:
  - sign type
  - confidence score
  - first detected date
  - last detected date
  - detection count
  - verification status
  - representative image

---

### 6.5 Live Field Devices Map

Purpose:

- Show active field devices or users on a separate map.

Important rule:

- Do not mix live devices and static signs in the same primary map by default. It can become visually confusing and expensive to render.

MVP behavior:

- Use polling every 5 to 10 seconds.
- WebSocket is optional and not required for MVP.

Features:

- Device marker.
- Last known location.
- Last seen time.
- Current session status.
- Device type.
- Last detected sign.

---

### 6.6 Detection Logs Page

Purpose:

- Admin-level raw detection inspection.

Columns:

- Detection event ID
- User
- Device
- Session
- Detected class name
- Confidence
- Latitude
- Longitude
- GPS accuracy
- Timestamp
- AI response time
- Image URL
- Validation status

---

### 6.7 Devices Page

Purpose:

- Manage and inspect connected field devices.

Columns:

- Device ID
- Device name
- Device type
- Owner user
- Last latitude
- Last longitude
- Last seen
- Status
- Total detections
- Active session status

Device types:

- mobile_phone
- vehicle_camera
- dashcam
- custom_iot_device
- test_device

---

### 6.8 Admin Review Page

Purpose:

- Allow admin to review AI detections and final traffic sign records.

Statuses:

- pending
- auto_verified
- manually_verified
- rejected
- duplicate
- low_confidence

---

## 7. Database Design

Use Supabase PostgreSQL.

### 7.1 profiles

Stores application-level user profile data connected to Supabase Auth users.

Recommended fields:

```sql
id uuid primary key default gen_random_uuid(),
auth_user_id uuid unique not null references auth.users(id) on delete cascade,
full_name text,
email text,
role text not null default 'user',
created_at timestamptz default now(),
updated_at timestamptz default now()
```

Allowed roles:

- user
- admin

---

### 7.2 devices

Stores devices connected to users.

Recommended fields:

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid references profiles(id) on delete set null,
device_name text not null,
device_type text not null,
device_identifier text unique,
last_latitude double precision,
last_longitude double precision,
last_seen_at timestamptz,
status text default 'inactive',
created_at timestamptz default now(),
updated_at timestamptz default now()
```

---

### 7.3 detection_sessions

Stores detection session lifecycle data.

Recommended fields:

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid not null references profiles(id) on delete cascade,
device_id uuid references devices(id) on delete set null,
started_at timestamptz default now(),
ended_at timestamptz,
status text not null default 'active',
total_frames integer default 0,
total_detections integer default 0,
average_confidence double precision,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

Statuses:

- active
- completed
- failed
- cancelled

---

### 7.4 detection_events

This is the most important raw AI response and detection log table.

Recommended fields:

```sql
id uuid primary key default gen_random_uuid(),
session_id uuid references detection_sessions(id) on delete cascade,
user_id uuid references profiles(id) on delete set null,
device_id uuid references devices(id) on delete set null,
image_url text,
latitude double precision,
longitude double precision,
gps_accuracy double precision,
heading double precision,
speed double precision,
detected_class_id integer,
detected_class_name text,
confidence double precision,
bbox_x double precision,
bbox_y double precision,
bbox_width double precision,
bbox_height double precision,
ai_response_raw jsonb,
ai_response_time_ms integer,
validation_status text default 'pending',
created_at timestamptz default now()
```

---

### 7.5 traffic_signs

Stores optimized/static sign inventory records shown on the map.

Recommended fields:

```sql
id uuid primary key default gen_random_uuid(),
sign_type text not null,
latitude double precision not null,
longitude double precision not null,
confidence_score double precision,
first_detected_at timestamptz,
last_detected_at timestamptz,
detection_count integer default 1,
verification_status text default 'pending',
representative_image_url text,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

---

### 7.6 traffic_sign_observations

Links raw detection events to optimized traffic sign records.

Recommended fields:

```sql
id uuid primary key default gen_random_uuid(),
traffic_sign_id uuid not null references traffic_signs(id) on delete cascade,
detection_event_id uuid not null references detection_events(id) on delete cascade,
distance_to_sign_meters double precision,
confidence double precision,
created_at timestamptz default now(),
unique(traffic_sign_id, detection_event_id)
```

---

### 7.7 device_location_logs

Stores device location history for live/polling map and future analysis.

Recommended fields:

```sql
id uuid primary key default gen_random_uuid(),
device_id uuid references devices(id) on delete cascade,
user_id uuid references profiles(id) on delete set null,
latitude double precision not null,
longitude double precision not null,
accuracy double precision,
speed double precision,
heading double precision,
recorded_at timestamptz default now()
```

---

### 7.8 system_logs

Stores important application/system events.

Recommended fields:

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid references profiles(id) on delete set null,
device_id uuid references devices(id) on delete set null,
action_type text not null,
message text,
metadata jsonb,
created_at timestamptz default now()
```

Example action types:

- LOGIN
- LOGOUT
- SESSION_STARTED
- SESSION_STOPPED
- IMAGE_UPLOADED
- AI_RESPONSE_RECEIVED
- DETECTION_SAVED
- LOCATION_UPDATED
- ERROR

---

## 8. Supabase Storage Plan

Create a storage bucket for captured frames.

Recommended bucket:

```text
traffic-sign-frames
```

Recommended path format:

```text
sessions/{sessionId}/{timestamp}-{randomId}.jpg
```

The database should store the public or signed image URL in `detection_events.image_url`.

For MVP, public URLs are acceptable if the project is not storing sensitive personal images. For production, prefer signed URLs and stricter access policies.

---

## 9. API Contract

### 9.1 Frontend to Backend: Capture Frame

Endpoint example:

```http
POST /api/detection/frame
```

Request type:

- multipart/form-data or JSON with base64 image.

Recommended metadata:

```json
{
  "sessionId": "uuid",
  "deviceId": "uuid",
  "latitude": 57.0488,
  "longitude": 9.9217,
  "gpsAccuracy": 8.5,
  "heading": 120.0,
  "speed": 12.3,
  "capturedAt": "2026-06-24T12:00:00Z"
}
```

---

### 9.2 Backend to AI Server

Endpoint should be configurable through environment variables.

Example:

```text
AI_MODEL_API_URL=https://example-ai-server.com/detect
AI_MODEL_API_KEY=optional-secret-key
```

Request body example:

```json
{
  "image_url": "https://storage-url/image.jpg",
  "session_id": "uuid",
  "device_id": "uuid",
  "timestamp": "2026-06-24T12:00:00Z"
}
```

Alternative:

- multipart image upload
- base64 image payload

Prefer image URL for cleaner architecture.

---

### 9.3 AI Server to Backend Response

Expected response shape:

```json
{
  "detections": [
    {
      "class_id": 14,
      "class_name": "Speed Limit 50",
      "confidence": 0.92,
      "bbox": {
        "x": 120,
        "y": 80,
        "width": 64,
        "height": 64
      }
    }
  ],
  "processing_time_ms": 180
}
```

The backend must save both parsed fields and the full raw response as JSON.

---

## 10. Localization and Duplicate Detection Algorithm

The system must not create a new map marker for every detection event.

Raw detection events should be grouped into optimized traffic sign records.

### 10.1 Matching Logic

For each new detection event:

1. Check if confidence is above the minimum threshold.
2. Search existing `traffic_signs` records with the same sign type.
3. Calculate distance between new detection location and existing sign location.
4. If distance is below threshold, treat the event as another observation of the same sign.
5. If no match exists, create a new `traffic_signs` record.

Recommended MVP threshold:

```text
15 to 30 meters
```

Use a simple Haversine distance calculation for MVP.

---

### 10.2 Weighted Location Refinement

When multiple observations exist for the same sign, update the final sign location using weighted average.

Recommended formula:

```text
weight = confidence / max(gps_accuracy, 1)
```

Then update:

```text
final_latitude = weighted_average(observation_latitudes)
final_longitude = weighted_average(observation_longitudes)
```

This reduces the effect of low-confidence or inaccurate GPS observations.

---

### 10.3 Auto Verification

Recommended MVP rule:

- If the same sign has at least 3 observations within the matching radius and average confidence is above 0.75, set `verification_status = 'auto_verified'`.
- Otherwise keep `verification_status = 'pending'`.

---

## 11. Logging Requirements

Logging is critical because the data can later be used for:

- AI model evaluation
- marketing demonstrations
- device performance analysis
- system debugging
- future external integrations
- map data quality improvement

The system must log:

1. User login/logout.
2. Detection session start/stop.
3. Captured image uploads.
4. AI API requests and responses.
5. AI API failures.
6. Detection event creation.
7. Traffic sign creation/update.
8. Device location updates.
9. Admin review actions.

---

## 12. MVP Scope

The MVP must include:

1. Supabase project connection.
2. Auth and role-based access.
3. Core database schema.
4. Image storage bucket.
5. Detection session page.
6. Camera access.
7. Geolocation access.
8. Frame capture and backend upload.
9. AI API request/response integration.
10. Detection event saving.
11. Static traffic sign map.
12. Admin detection logs page.
13. Device table and basic device tracking.
14. System log records.

---

## 13. Optional Advanced Scope

If time remains, implement:

1. Live field devices map.
2. Heatmap for dense detection areas.
3. CSV/Excel export.
4. Advanced review workflow.
5. Model performance analytics.
6. Multi-model support.
7. Map clustering optimization.
8. WebSocket-based live tracking.

---

## 14. Recommended Development Order

1. Project setup.
2. Supabase connection.
3. Auth and protected routes.
4. Database schema and RLS.
5. Core layout and navigation.
6. Dashboard page.
7. Device registration/listing.
8. Detection session start/stop.
9. Camera and GPS browser integration.
10. Frame upload to backend.
11. AI API integration.
12. Save detection events.
13. Implement duplicate matching and traffic sign inventory update.
14. Build static traffic sign map.
15. Build admin detection logs.
16. Build device location logs.
17. Build live devices map if time remains.
18. Final testing and documentation.

---

## 15. Core Architectural Decision

The AI model must be treated as an external service.

Do not spend MVP time training a model inside this project. The project should focus on:

- integrating AI model responses,
- combining them with geolocation,
- storing complete logs,
- grouping duplicate detections,
- building a reliable traffic sign inventory,
- visualizing results on a map dashboard.

This keeps the project realistic, scalable, and academically strong.
