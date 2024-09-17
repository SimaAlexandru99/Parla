import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getMonthRanges } from "@/lib/dbUtils";

interface AggregationResult {
  _id: null;
  averageDuration: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const database = searchParams.get("database");
  const username = searchParams.get("username");

  if (!database) {
    return NextResponse.json(
      { error: "Invalid database parameter" },
      { status: 400 }
    );
  }

  try {
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

    const pipeline = (startDate: string, endDate: string) => [
      matchStage,
      {
        $match: {
          day_processed: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: "$file_info.duration" },
        },
      },
    ];

    const [currentMonthResult, lastMonthResult] = await Promise.all([
      collection
        .aggregate<AggregationResult>(
          pipeline(startOfMonthString, startOfNextMonthString)
        )
        .toArray(),
      collection
        .aggregate<AggregationResult>(
          pipeline(startOfLastMonthString, startOfThisMonthString)
        )
        .toArray(),
    ]);

    const averageDurationInSecondsCurrentMonth =
      currentMonthResult[0]?.averageDuration || 0;
    const averageDurationInSecondsLastMonth =
      lastMonthResult[0]?.averageDuration || 0;

    const averageDurationText = formatDuration(
      averageDurationInSecondsCurrentMonth
    );

    return NextResponse.json({
      averageDurationText,
      averageDurationInSecondsCurrentMonth,
      averageDurationInSecondsLastMonth,
    });
  } catch (error) {
    console.error("Error calculating average audio duration:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}

const formatDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes} m ${seconds} s`;
};
