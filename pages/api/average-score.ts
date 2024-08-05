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

    const [currentMonthResult] = await collection.aggregate(pipelineCurrentMonth).toArray();
    const [lastMonthResult] = await collection.aggregate(pipelineLastMonth).toArray();

    const averageScoreCurrentMonth = Number((currentMonthResult?.averageScore || 0).toFixed(2));
    const averageScoreLastMonth = Number((lastMonthResult?.averageScore || 0).toFixed(2));

    res.status(200).json({ averageScoreCurrentMonth, averageScoreLastMonth });
  } catch (error) {
    console.error("Error calculating average score:", error);
    res.status(500).json({
      status: `Error calculating average score: ${(error as Error).message}`,
    });
  }
};

export default handler;