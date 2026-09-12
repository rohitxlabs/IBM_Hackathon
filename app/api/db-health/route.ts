import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const [row] = await sql`SELECT version(), now() AS server_time`;
    return NextResponse.json({ connected: true, ...row });
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
