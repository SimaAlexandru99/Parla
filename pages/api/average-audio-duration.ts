import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase, getMonthRanges } from "@/lib/dbUtils";

interface AggregationResult {
  _id: null;
  averageDuration: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { database, username } = req.query;
  if (typeof database !== "string") {
    res.status(400).json({ error: "Invalid database parameter" });
    return;
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

    res.status(200).json({
      averageDurationText,
      averageDurationInSecondsCurrentMonth,
      averageDurationInSecondsLastMonth,
    });
  } catch (error) {
    console.error("Error calculating average audio duration:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

const formatDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes} m ${seconds} s`;
};

export default handler;