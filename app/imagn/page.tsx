import { ProjectArticle, getProjectMetadata } from "@/components/project-article";

export const metadata = getProjectMetadata("imagn");

export default function ImagnPage() {
  return <ProjectArticle slug="imagn" />;
}
