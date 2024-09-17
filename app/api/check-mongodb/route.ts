import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbUtils";

export async function GET(_request: NextRequest) {
  try {
    console.log("Connecting to MongoDB...");
    const client = await connectToDatabase();

    console.log("Connected, pinging admin database...");
    await client.db("admin").command({ ping: 1 });

    console.log("Ping successful, connection will remain open.");

    return NextResponse.json({ status: "Connected to MongoDB" });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return NextResponse.json(
      {
        status: `Failed to connect to MongoDB: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
