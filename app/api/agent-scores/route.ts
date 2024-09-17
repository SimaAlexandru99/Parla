import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbUtils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const database = searchParams.get("database");
  const username = searchParams.get("username");

  if (!database || !username) {
    return NextResponse.json(
      { message: "Invalid query parameters" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    // Aggregate scores by month for the specific agent
    const result = await collection
      .aggregate([
        { $match: { "agent_info.username": username } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: { $toDate: "$day_processed" },
              },
            },
            averageScore: { $avg: "$score" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            month: "$_id",
            score: { $round: ["$averageScore", 2] },
          },
        },
      ])
      .toArray();

    // If no results, return an empty array
    if (result.length === 0) {
      return NextResponse.json([]);
    }

    // Return the results
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching agent scores:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
