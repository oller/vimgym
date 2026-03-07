# Database Type Inference Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure all Zod schemas related to database operations strictly satisfy Supabase generated types to guarantee compile-time safety and alignment between the application boundary and the database schema.

**Architecture:** We will introduce Supabase helper types (`TablesInsert`, `TablesUpdate`, `Tables`) into our Zod schema definitions in `src/schemas/index.ts`. By appending `satisfies z.ZodType<DatabaseType>` to our schema declarations, TypeScript will enforce that the Zod schemas correctly mirror the database shapes. If the database schema changes and we re-generate types, `tsc` will catch any out-of-sync Zod schemas.

**Tech Stack:** TypeScript, Zod, Supabase

---

### Task 1: Add strictly typed database insertion schema

**Files:**
- Modify: `src/schemas/index.ts`
- Modify: `src/api/index.ts`

**Step 1: Write the schema definition (modify schema to satisfy insert type)**

In `src/schemas/index.ts`, we need to define a Zod schema that specifically mirrors the Supabase database insert type. 

Modify `src/schemas/index.ts` to include:

```typescript
import type { TablesInsert } from "../types/database";

export const levelCompletionDbInsertSchema = z.object({
  completed_at: z.string().nullable().optional(),
  id: z.string().optional(),
  keystrokes: z.array(z.string()),
  keystrokes_count: z.number(),
  level_id: z.string(),
  user_id: z.string().nullable().optional(),
}) satisfies z.ZodType<TablesInsert<"level_completions">>;
```

*Note: Ensure `TablesInsert` is imported correctly from `../types/database`.*

**Step 2: Run type check to verify it passes**

Run: `pnpm tsc`
Expected: PASS

**Step 3: Update `src/api/index.ts` to use the new strict DB schema**

Update the insert call in `src/api/index.ts` to pass through our new Zod schema to guarantee the mapped object conforms to the strict DB schema before we pass it to the Supabase client.

In `src/api/index.ts`:

```typescript
// Add import at the top
import { levelCompletionDbInsertSchema } from "../schemas";

// Inside submitLevelCompletion, replace the raw object insert with:
    const dbPayload = levelCompletionDbInsertSchema.parse({
      user_id: validatedData.userId,
      level_id: validatedData.level,
      keystrokes_count: validatedData.score,
      keystrokes: validatedData.keystrokes,
    });

    console.log("📤 Sending to Supabase...");
    const { error } = await client.from("level_completions").insert(dbPayload);
```

**Step 4: Run tests / type check to verify it passes**

Run: `pnpm tsc && pnpm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/schemas/index.ts src/api/index.ts
git commit -m "feat: enforce strict database types on zod schemas"
```
