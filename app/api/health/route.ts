import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Confirms the API process is up and that a real query reaches PostgreSQL.
 */
export async function GET() {
  const startedAt = Date.now();

  try {
    const [row] = await prisma.$queryRaw<
      { now: Date; version: string }[]
    >`SELECT now() AS now, version() AS version`;

    return NextResponse.json({
      status: "ok",
      api: "up",
      database: {
        connected: true,
        serverTime: row.now,
        // Only the engine name/version, never the connection string.
        version: row.version.split(" ").slice(0, 2).join(" "),
        latencyMs: Date.now() - startedAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[health] database check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        api: "up",
        database: { connected: false, latencyMs: Date.now() - startedAt },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
