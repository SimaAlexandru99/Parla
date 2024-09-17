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
          averageProcessingTime: { $avg: "$processing_time_seconds" },
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
          averageProcessingTime: { $avg: "$processing_time_seconds" },
        },
      },
    ];

    const [currentMonthResult] = await collection
      .aggregate(pipelineCurrentMonth)
      .toArray();
    const [lastMonthResult] = await collection
      .aggregate(pipelineLastMonth)
      .toArray();

    const averageProcessingTimeInSecondsCurrentMonth =
      currentMonthResult?.averageProcessingTime || 0;
    const averageProcessingTimeInSecondsLastMonth =
      lastMonthResult?.averageProcessingTime || 0;

    const averageProcessingTimeText = formatDuration(
      averageProcessingTimeInSecondsCurrentMonth
    );

    return NextResponse.json({
      averageProcessingTimeText,
      averageProcessingTimeInSecondsCurrentMonth,
      averageProcessingTimeInSecondsLastMonth,
    });
  } catch (error) {
    console.error("Error calculating average processing time:", error);
    return NextResponse.json(
      {
        status: `Error calculating average processing time: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

const formatDuration = (durationInSeconds: number) => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes} m ${seconds} s`;
};
