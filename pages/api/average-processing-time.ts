import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase, getMonthRanges } from "@/lib/dbUtils";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { database, username } = req.query;
    if (typeof database !== 'string') {
      res.status(400).json({ error: 'Invalid database parameter' });
      return;
    }

    const client = await connectToDatabase();
    const db = client.db(database);
    const collection = db.collection("calls");

    const { startOfMonthString, startOfNextMonthString, startOfLastMonthString, startOfThisMonthString } = getMonthRanges();

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

    const [currentMonthResult] = await collection.aggregate(pipelineCurrentMonth).toArray();
    const [lastMonthResult] = await collection.aggregate(pipelineLastMonth).toArray();

    const averageProcessingTimeInSecondsCurrentMonth = currentMonthResult?.averageProcessingTime || 0;
    const averageProcessingTimeInSecondsLastMonth = lastMonthResult?.averageProcessingTime || 0;

    const averageProcessingTimeText = formatDuration(averageProcessingTimeInSecondsCurrentMonth);

    res.status(200).json({ 
      averageProcessingTimeText, 
      averageProcessingTimeInSecondsCurrentMonth, 
      averageProcessingTimeInSecondsLastMonth 
    });
  } catch (error) {
    console.error("Error calculating average processing time:", error);
    res.status(500).json({
      status: `Error calculating average processing time: ${(error as Error).message}`,
    });
  }
};

const formatDuration = (durationInSeconds: number) => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes} m ${seconds} s`;
};

export default handler;