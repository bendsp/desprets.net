import { ProjectArticle, getProjectMetadata } from "@/components/project-article";

export const metadata = getProjectMetadata("garden");

export default function GardenPage() {
  return <ProjectArticle slug="garden" />;
}
