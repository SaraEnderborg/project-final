# Chronos — Visual History Timeline

A full-stack interactive history analysis tool that allows users to explore and compare historical events across multiple timelines.

Tech stack:
React • Node.js • Express • MongoDB • React Query • Zustand

# Chronos — Visual History Timeline

Chronos is a visual history analysis tool that allows users to explore and compare historical events across multiple domains using interactive timelines.

The application makes it possible to place different historical processes on parallel timelines (for example war, medicine, or political change) in order to explore patterns, overlaps, and historical context.

The project was built as a full-stack application using React, Node.js, Express, and MongoDB.

---

# Features

- Interactive timeline visualization
- Multiple timeline layers that can be compared
- Category filtering for each layer
- Event clustering when events occur close in time
- Event detail panel
- User authentication (signup/login)
- Data imported automatically from Wikidata
- Responsive design (mobile → desktop)
- Accessible interface with keyboard navigation

Example comparison:

War timeline vs Medicine timeline

This makes it easier to explore relationships between historical developments across domains.

---

# Tech Stack

## Frontend

- React
- React Router
- React Query
- Zustand (global state)
- Vite

## Backend

- Node.js
- Express

## Database

- MongoDB
- Mongoose

## External Data

- Wikidata SPARQL API

---

# Architecture Overview

The project follows a **feature-based architecture**.

Instead of organizing files only by type, code is grouped by functionality.

Example:

frontend/src/features/

layers → fetching layer data
timeline → timeline UI and visualization

This structure improves scalability and maintainability.

---

# Project Structure

## Backend

backend/

api/layers
integrations/wikidata
jobs/import
models
routes
middleware

Important files:

server.js → Express server
Event.js → timeline event model
Layer.js → timeline layer model
User.js → authentication model

---

## Frontend

frontend/src/

api/ → HTTP client and query keys
app/ → router + React Query client
features/ → feature-based modules
components/ → shared components
layouts/ → layout system
pages/ → main application pages
stores/ → Zustand global state

Example feature module:

features/timeline/

TimelinePage.jsx
TimelineRow.jsx
EventDot.jsx
YearAxis.jsx
EventPanel.jsx

---

# Data Model

## Layer

Represents a domain timeline.

Example:

War & Organized Violence
Medicine & Disease

Fields:

name
slug
categories
rangeStart
rangeEnd

---

## Event

Represents a historical event.

Fields:

layerId
title
summary
startDate
endDate
category
tags
location
sources
externalIds.wikidataQid
lastSyncedAt

---

# API Endpoints

GET /api/layers

Returns available timeline layers.

GET /api/layers/:id/events

Returns events for a specific layer.

Optional query parameters:

category
from
to

Example:

/api/layers/war/events?category=civil_war

---

# Wikidata Import System

Historical events are imported from Wikidata using SPARQL queries.

Each domain has its own import job.

Example jobs:

war.job.js
medicine.job.js

Import pipeline:

SPARQL query
→ map results
→ deduplicate by Wikidata QID
→ upsert into MongoDB

Example command:

node jobs/import/war.job.js --dry-run

Dry run allows testing the import without writing to the database.

---

# Timeline System

Events are rendered as dots on a horizontal timeline.

The position is calculated using a helper function:

dateToPercent()

This converts event dates into positions on the timeline.

Events close in time are automatically grouped into clusters.

Clicking a cluster expands it to reveal individual events.

---

# Authentication

User authentication is implemented with:

- email + password
- protected routes
- JWT authentication
- Zustand auth state

Authenticated users can access the main application area.

---

# Responsive Design

The application is designed mobile-first and works on screens between:

320px → 1600px

Mobile improvements include:

- wrapped layer selector
- touch-friendly event dots
- flexible timeline layout

---

# Accessibility

Accessibility improvements include:

- semantic HTML elements
- keyboard-accessible timeline events
- focus states
- ARIA labels
- reduced motion support

The goal is to achieve a Lighthouse accessibility score of 100.

---

# Running the Project Locally

## 1. Clone repository

git clone https://github.com/your-username/chronos

---

## 2. Backend setup

cd backend

npm install

Create a .env file:

MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret

Run server:

npm run dev

---

## 3. Frontend setup

cd frontend

npm install

Run development server:

npm run dev

The frontend will typically run on:

http://localhost:5173

---

# Demo Walkthrough

1. Register a user account
2. Log in to the application
3. Select one or two timeline layers
4. Filter by category
5. Click events to open the detail panel
6. Expand clusters to inspect individual events
7. Compare historical patterns across domains

---

# Future Improvements

Possible future improvements include:

- timeline zoom and custom year ranges
- smoother timeline animations
- improved clustering algorithm
- additional timeline layers
- saved timeline comparisons
- user annotations

---

# Learning Goals

This project was built to explore:

- full-stack application architecture
- data visualization with React
- working with external data APIs
- designing scalable frontend structure
- building accessible interfaces

---

# Author

Sara Enderborg

Chronos combines historical analysis with interactive data visualization to explore patterns across time.
