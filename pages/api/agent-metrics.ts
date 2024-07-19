// pages/api/agent-metrics.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { database, username } = req.query;

    if (!database || !username) {
      return res
        .status(400)
        .json({ error: "Missing database or username parameter" });
    }

    const client = await connectToDatabase();
    const db = client.db(database as string);
    const callsCollection = db.collection("calls");

    // Fetch average metrics
    const metricsPipeline = [
      { $match: { "agent_info.username": username } },
      {
        $group: {
          _id: null,
          avgSentiment: { $avg: "$average_sentiment" },
          totalDeadAirSpeaker00: {
            $sum: "$total_dead_air_duration.SPEAKER_00",
          },
          totalTalkDurationSpeaker00: {
            $sum: "$total_talk_duration.SPEAKER_00",
          },
        },
      },
    ];

    const metricsResult = await callsCollection
      .aggregate(metricsPipeline)
      .toArray();
    const metrics = metricsResult[0] || {
      avgSentiment: 0,
      totalDeadAirSpeaker00: 0,
      totalTalkDurationSpeaker00: 0,
    };

    // Fetch data for visualization
    const visualizationPipeline = [
      { $match: { "agent_info.username": username } },
      {
        $group: {
          _id: "$day_processed",
          avgSentiment: { $avg: "$average_sentiment" },
          totalDeadAirSpeaker00: {
            $sum: "$total_dead_air_duration.SPEAKER_00",
          },
          totalTalkDurationSpeaker00: {
            $sum: "$total_talk_duration.SPEAKER_00",
          },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const visualizationData = await callsCollection
      .aggregate(visualizationPipeline)
      .toArray();

    res.status(200).json({
      sentimentData: visualizationData.map((item) => ({
        time: item._id,
        value: item.avgSentiment,
      })),
      deadAirData: visualizationData.map((item) => ({
        time: item._id,
        value: item.totalDeadAirSpeaker00,
      })),
      talkDurationData: visualizationData.map((item) => ({
        time: item._id,
        value: item.totalTalkDurationSpeaker00,
      })),
      ...metrics,
    });
  } catch (error) {
    console.error("Error fetching agent metrics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
