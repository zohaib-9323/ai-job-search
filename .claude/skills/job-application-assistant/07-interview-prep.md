---
framework_version: 1.0.0
---

# Interview Preparation Guide

<!-- SETUP: STAR examples are personalized by running /setup based on your actual experience -->

## STAR Format

Structure answers as: **Situation** (context), **Task** (your responsibility), **Action** (what you did), **Result** (outcome).

Keep answers to 1-2 minutes. Be specific. End with what you learned or would do differently.

## Ready-Made STAR Examples

<!-- Drafted by /setup from the CV (2026-10-25). Facts come from the CV; the Situation framing and the "why" details are for Zohaib to fill in or correct in their own words before using them. -->

### 1. Trade Harmonizer RAG system in one week (AI engineering, speed, ownership)
**S:** Trade Harmonizer, a multi-tenant SaaS platform for shipment management and trade compliance (C88 documentation, denied-party screening), needed an AI knowledge base. *[Add: who asked for it, and why one week?]*
**T:** Design and deliver the complete RAG system on a one-week timeline.
**A:** Built the full pipeline: document chunking, embeddings and semantic search. Added admin tools for guidance prompts, knowledge testing, publishing and version history so non-engineers could manage the knowledge base.
**R:** Delivered a complete, working RAG system in one week. *[Add: usage or feedback since launch, if known]*
**Use for:** "Tell me about an AI/LLM feature you built", "Describe working under a tight deadline", "Your most complex project"

### 2. Multi-tenant security: RBAC, JWT and tenant isolation (security, architecture)
**S:** Trade Harmonizer serves several companies on one platform, each with admin, owner and company-user roles, so a data leak between tenants would be critical.
**T:** Own authentication, authorization and tenant isolation.
**A:** Implemented JWT authentication, role-based access control for the three roles, and tenant isolation in the NestJS/MongoDB backend. Ran Trivy security scans and supported a third-party penetration test.
**R:** The penetration test found only 4 to 5 low-severity configuration issues. *[Add: how they were fixed]*
**Use for:** "How do you approach security?", "Explain a system design decision", "Multi-tenancy experience"

### 3. Redis caching cut API response time ~35% (performance, problem solving)
**S:** At DevExcelIT Solutions, MongoDB/Mongoose endpoints used by the frontend apps were slower than they should be. *[Add: which endpoints, how it was noticed]*
**T:** Improve API response time without rewriting the data layer.
**A:** Added Redis caching to the MongoDB/Mongoose endpoints. *[Add: cache keys, invalidation strategy, TTLs]*
**R:** Average response time dropped by about 35%.
**Use for:** "Tell me about a performance optimization", "How do you debug slow APIs?", "Caching strategies"

### 4. CI/CD pipeline cut deployment time ~50% (DevOps, process improvement)
**S:** Deployments at DevExcelIT Solutions were slow and largely manual. *[Confirm and add detail]*
**T:** Make shipping faster and more reliable.
**A:** Set up CI/CD with GitHub Actions, Docker and AWS (EC2, S3).
**R:** Deployment time dropped by about 50%.
**Use for:** "How have you improved a team process?", "DevOps experience", "Initiative beyond your assigned tasks"

### 5. Capture AI: keeping workflows alive when the AI is slow (resilience, AI in production)
**S:** Capture AI is an AI SaaS platform for chatbot automation and lead management that depends on third-party LLM APIs, which can respond slowly or fail.
**T:** Build the backend so that customer workflows and billing keep working anyway.
**A:** Built the NestJS/Node.js backend (dashboard analytics, chatbot configuration, AI knowledge base, engagement workflows, subscriptions), integrated Stripe, and added server-side handling for slow or failed AI responses.
**R:** Workflows keep running when AI responses are slow or fail. *[Add: concrete impact]*
**Use for:** "Handling third-party API failures", "Building with LLMs in production", "Error handling"

### 6. TaskFlow: offline-first PWA shipped to Android with no native code (quality, testing)
**S:** Personal project to build a fully offline-capable task manager.
**T:** Make it installable, offline-first, well tested and available on Android without writing a native app.
**A:** Built it with Next.js 16, React 19, TypeScript, IndexedDB and a hand-written service worker; wrapped it as a Trusted Web Activity with Bubblewrap; wrote 59 Vitest unit/integration tests and 14 Playwright E2E tests.
**R:** Lighthouse mobile scores of 94 performance, 100 accessibility, 100 best practices, 100 SEO; every web deploy updates the Android app.
**Use for:** "How do you approach testing?", "A project you're proud of", "Frontend performance / accessibility"

## Common Tough Questions

### "Why are you looking to leave DevExcelIT Solutions?"
> Draft (edit in your own words): "I've learned a lot there - multi-tenant SaaS, a full RAG system, CI/CD. I'm now looking for a role where I can go deeper into AI-powered products and work with a larger or international team." Stay positive about DevExcelIT.

### "You don't have [specific skill/experience]."
> Acknowledge the gap honestly, bridge to the closest thing you have done (e.g. no PostgreSQL in production -> Prisma and Supabase, solid data modeling in MongoDB), and point to how fast you shipped new tech before (RAG system in one week).

### "Where do you see yourself in 5 years?"
> Draft: a senior full-stack / AI engineer who owns the architecture of AI-powered products. *[Personalize]*

### "What's your biggest weakness?"
> *[Prepare a genuine one with a concrete mitigation - not provided during setup]*

### "Why this company specifically?"
> Customize per company. Must reference: specific projects, company values, market position, or team structure. Never give a generic answer.

## Questions You Should Ask Interviewers

### About the Role
- "What does a typical week look like in this role?"
- "What would success look like in the first 6 months?"
- "What's the biggest challenge the team is facing right now?"

### About the Team
- "How big is the team, and how do you divide work?"
- "What does the development/project lifecycle look like, from idea to production?"
- "How do you onboard new team members?"

### About Tech & Growth
- "What's your current tech stack for [relevant area]?"
- "Is there room to grow into more architectural or strategic decisions?"
- "How does the team stay current with new tools and methods?"

### About Culture (use these to prevent disappointment)
- "How would you describe the team culture?"
- "What does professional development look like here?"
- "Is there flexibility for remote/hybrid work?"
- "What's the balance between development/new projects and maintenance work?"
- "How would you describe the leadership style in this team?"
- "What do people who thrive here have in common?"

## Phone/Video Interview Tips
- Have STAR examples written out (use this file)
- Keep a glass of water nearby
- Smile when speaking (it changes your tone)
- Ask for clarification if a question is vague
- It's OK to take 5 seconds to think before answering
- End with: "Is there anything else you'd like to know about my background?"

## After the Application (Best Practice)

### Follow-Up Etiquette
- **Don't call to "stand out"** or to learn more about the role post-submission - this risks a negative impression
- If the employer specified a timeline, respect it and wait
- If no timeline was given and significant time has passed (2+ weeks), a brief call to ask about status is acceptable
- If you have genuinely new, relevant information to share, a short follow-up is fine

### Thank-You Notes
- When you receive any update (interview invitation, rejection, or status update), send a brief thank-you message
- Express appreciation for their time and the process
- Keep it short (2-3 sentences)

## Roleplay Guidelines
When the user asks for interview practice:
1. Ask which role/company to simulate
2. Start with easy warm-up questions ("Tell me about yourself")
3. Progress to role-specific technical questions
4. Include 1-2 behavioral questions using the competencies from the job posting
5. End with a tough question or curveball
6. After each answer, give brief feedback: what worked, what to sharpen
7. Suggest which STAR example would work best for each question
