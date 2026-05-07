import { ProjectArticle, getProjectMetadata } from "@/components/project-article";

export const metadata = getProjectMetadata("raybeam");

export default function RayBeamPage() {
  return <ProjectArticle slug="raybeam" />;
}
