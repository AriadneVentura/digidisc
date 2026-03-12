# 💿💻🌙 DigiDisc 💿💻🌙

A clip sharing app for me and my friends, so after games are played the best clips can be uploaded and rewatched, liked,
and most importantly, not forgotten :)

It’s a full-stack screen recording and video sharing platform built with Next.js and Bunny.net.
Users can securely sign in with google authentication, upload videos and thumbnails (or generate a randomised
thumbnail from their own video if they don’t want to upload one), and screen record directly within the platform.
Every video is attached to a user, so ownership is clear and secure too.

Users can set videos as public or private, share them via link, like each other’s videos (or their own hehe), and delete
their own videos too. There’s a search bar to make finding content easy, with filtering options such as most liked,
oldest, newest, and most viewed, allowing content to be ranked by popularity.

DigiDisc uses route protection and middleware authentication to ensure only logged-in users can access content,
along with Arcjet protection to guard against common web attacks and automated bot abuse.

Hosted: https://digidisc.tv

**Future goals:**
- Video
    - Edit title/description
    - tags
- Upload
    - Video triming/selecting a good "portion" to upload
    - Selecting a frame from the video for a thumbnail
- Screen recording:
    - Selecting camera option
    - Selecting microphone
- Other
    - Dark mode
---

## 📼🐛🎮 Tools 📼🐛🎮

- Next.js: A React framework for building full stack web apps with server-side rendering and API routes.
- Better Auth: A TypeScript authentication library that handles secure login, sessions, and user management.
- Drizzle ORM: A type-safe, lightweight ORM for SQL databases.
- Neon: A serverless PostgreSQL platform that provides scalable, cloud-hosted databases with branching and autoscaling.
- Bunny.net: A global video delivery and CDN platform for fast, secure streaming and storage of media.
- Arcjet: A security layer for applications that provides bot protection, rate limiting, and abuse prevention.
- Tailwind & TypeScript & React

Cred to flat icon & JSM
