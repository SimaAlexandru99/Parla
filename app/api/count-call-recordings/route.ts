import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getMonthRanges } from "@/lib/dbUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const database = searchParams.get("database");
    const username = searchParams.get("username");

    if (!database) {
      return NextResponse.json(
        { error: "Invalid database parameter" },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    const {
      startOfMonthString,
      startOfNextMonthString,
      startOfLastMonthString,
      startOfThisMonthString,
    } = getMonthRanges();

    const matchStage = username ? { "agent_info.username": username } : {};

    const currentMonthCount = await collection.countDocuments({
      ...matchStage,
      day_processed: {
        $gte: startOfMonthString,
        $lt: startOfNextMonthString,
      },
    });

    const lastMonthCount = await collection.countDocuments({
      ...matchStage,
      day_processed: {
        $gte: startOfLastMonthString,
        $lt: startOfThisMonthString,
      },
    });

    return NextResponse.json({ currentMonthCount, lastMonthCount });
  } catch (error) {
    console.error("Failed to count documents:", error);
    return NextResponse.json(
      {
        error: `Failed to count documents: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
