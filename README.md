# 💿💻🌙 DigiDisc 💿💻🌙

A clip sharing app for me and my friends, so after games are played the best clips can be uploaded and rewatched, liked,
and most importantly, not forgotten :)

It’s a full stack screen recording and video sharing platform built with Next.js and Bunny.net.
Users can securely sign in with google authentication, upload videos and thumbnails (select or generate a randomised
thumbnail from their own video if they don’t want to upload one), and screen record directly within the platform.
Also they can trim the videos they uploaded as well :D.
Every video is attached to a user, so ownership is clear and secure too.

Users can set videos as public or private, share them via link, like each other’s videos (or their own hehe), and delete
their own videos too. There’s a search bar to make finding content easy, with filtering options such as most liked,
oldest, newest, and most viewed, allowing content to be ranked by popularity.

DigiDisc uses route protection and middleware authentication to ensure only logged-in users can access content,
along with Arcjet protection to guard against common web attacks and automated bot abuse.

Hosted: https://digidisc.tv

**Future goals:**

- Video
    - Edit title/description/tags/game category
    - comments
- Other
    - Role based groups
    - Admin access
    - Refactor form

---

## 📼🐛🎮 Tools 📼🐛🎮

- Next.js
- Better Auth
- Drizzle ORM
- Neon (A serverless PostgreSQL platform that provides scalable, cloud-hosted databases with autoscaling)
- Bunny.net (A global video delivery and CDN platform for fast, secure streaming and storage of media)
- Arcjet (A security layer for applications that provides bot protection, rate limiting, and abuse prevention)
- RAWG (Largest open-source game database used to attach clip to a game!)
- Tailwind & TypeScript & React

Cred to flat icon & JSM \
Cred to this for the custom cursors http://www.rw-designer.com/cursor-set/classic-1 \
Cred to this for the cute mini y2k gifs https://sadthemes.tumblr.com/smolpxl
