import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, database } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!database || typeof database !== "string") {
    return res.status(400).json({ message: "Database parameter is required" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database);
    const projectsCollection = db.collection("projects");
    const agentsCollection = db.collection("agents");

    const project = await projectsCollection.findOne({
      _id: new ObjectId(id as string),
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const agentsCount = await agentsCollection.countDocuments({
      project: project.project_name,
    });

    const projectDetails = {
      ...project,
      _id: project._id.toString(),
      agentsCount,
    };

    res.status(200).json(projectDetails);
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
