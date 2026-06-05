export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  github: string;
  liveUrl?: string;
  date: string; // ISO date
}

const projects: Project[] = [
  // Add your projects here. Example:
  // {
  //   id: "example-project",
  //   title: "Example Project",
  //   description: "A brief description of what this project does.",
  //   tech: ["TypeScript", "React", "Node.js"],
  //   github: "https://github.com/Liam-Sango/example",
  //   liveUrl: "https://example.com",
  //   date: "2026-01-15",
  // },
];

export default projects;
