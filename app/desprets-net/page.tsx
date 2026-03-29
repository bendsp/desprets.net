import { ProjectArticle, getProjectMetadata } from "@/components/project-article";

export const metadata = getProjectMetadata("desprets-net");

export default function DespretsNetPage() {
  return <ProjectArticle slug="desprets-net" />;
}
