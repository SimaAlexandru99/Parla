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

    const matchStage = username
      ? { $match: { "agent_info.username": username } }
      : { $match: {} };

    const pipelineCurrentMonth = [
      matchStage,
      {
        $match: {
          day_processed: {
            $gte: startOfMonthString,
            $lt: startOfNextMonthString,
          },
        },
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" },
        },
      },
    ];

    const pipelineLastMonth = [
      matchStage,
      {
        $match: {
          day_processed: {
            $gte: startOfLastMonthString,
            $lt: startOfThisMonthString,
          },
        },
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" },
        },
      },
    ];

    const [currentMonthResult] = await collection
      .aggregate(pipelineCurrentMonth)
      .toArray();
    const [lastMonthResult] = await collection
      .aggregate(pipelineLastMonth)
      .toArray();

    const averageScoreCurrentMonth = Number(
      (currentMonthResult?.averageScore || 0).toFixed(2)
    );
    const averageScoreLastMonth = Number(
      (lastMonthResult?.averageScore || 0).toFixed(2)
    );

    return NextResponse.json({
      averageScoreCurrentMonth,
      averageScoreLastMonth,
    });
  } catch (error) {
    console.error("Error calculating average score:", error);
    return NextResponse.json(
      {
        status: `Error calculating average score: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
