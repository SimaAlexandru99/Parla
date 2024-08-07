import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log("Connecting to MongoDB...");
    const client = await connectToDatabase();

    console.log("Connected, pinging admin database...");
    await client.db("admin").command({ ping: 1 });

    console.log("Ping successful, connection will remain open.");

    res.status(200).json({ status: "Connected to MongoDB" });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    res.status(500).json({
      status: `Failed to connect to MongoDB: ${(error as Error).message}`,
    });
  }
};

export default handler;
