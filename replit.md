# Kindred — AI Message Builder

A web app that analyzes pasted conversations and creates editable replies in a selected tone.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the shared API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required secret: `GROQ_API_KEY` — used only by the API server for reply generation

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite
- API: Express 5, Groq chat completions
- Validation: generated Zod schemas
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/message-builder/` — web interface and theme
- `artifacts/api-server/src/routes/message-builder.ts` — reply generation endpoint
- `lib/api-spec/openapi.yaml` — source of truth for request and response contracts

## Architecture decisions

- Groq is the requested AI provider; keep its key and API calls server-side.
- Conversations are not persisted by the app; each draft is generated from the current page state.

## Product

- Paste a message or conversation and choose a reply tone.
- Infer the recipient, relationship, and conversation context.
- Generate, edit, and copy a natural reply.

## User preferences

- Use Groq for AI reply generation.

## Gotchas

- Conversation text is sent to Groq to generate a reply; do not describe it as staying only in the browser.
- Keep `GROQ_API_KEY` out of frontend code and logs.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
