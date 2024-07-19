import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";
import { ProjectDetails } from '@/types/PropsTypes';  // Ensure this import path is correct


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { database, page = '1', limit = '10', search = '' } = req.query;

  if (!database) {
    return res.status(400).json({ error: "Database name is required" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(database as string);
    const projectsCollection = db.collection("projects");
    const agentsCollection = db.collection("agents");

    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};
    if (search) {
      query = {
        $or: [
          { project_name: { $regex: search as string, $options: 'i' } },
          { companies_names: { $regex: search as string, $options: 'i' } }
        ]
      };
    }

    const projects = await projectsCollection
      .find(query)
      .skip(skip)
      .limit(Number(limit))
      .toArray();

    const totalProjects = await projectsCollection.countDocuments(query);

    const formattedProjects: ProjectDetails[] = await Promise.all(projects.map(async (project) => {
      const agentsCount = await agentsCollection.countDocuments({ project: project.project_name });
      return {
        _id: project._id.toString(),
        project_name: project.project_name,
        greetings_words: project.greetings_words || [],
        companies_names: project.companies_names || [],
        availability_words: project.availability_words || [],
        from_what_company: project.from_what_company || [],
        positive_words: project.positive_words || [],
        negative_words: project.negative_words || [],
        common_words: project.common_words || [],
        words_to_remove: project.words_to_remove || [],
        analyze_agent_presented: project.analyze_agent_presented || false,
        analyze_company_presented: project.analyze_company_presented || false,
        analyze_client_availability: project.analyze_client_availability || false,
        analyze_from_what_company: project.analyze_from_what_company || false,
        agentsCount,
      };
    }));

    res.status(200).json({ projects: formattedProjects, totalProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: `Error fetching projects: ${(error as Error).message}` });
  }
};

export default handler;