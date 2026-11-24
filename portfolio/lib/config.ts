export const site = {
  name: "Your Name",
  tagline: "Ideas, projects, and what people actually want.",
  // Owner has not confirmed the timezone yet; daily counts use UTC until changed.
  timezone: "UTC",
};

export const categories: string[] = ["Web", "Mobile", "AI", "Tools", "Other"];

export const statuses: { project: string[]; idea: string[] } = {
  project: ["Live", "In progress", "Paused", "Archived"],
  idea: ["Idea", "Exploring", "Building", "Shipped"],
};
