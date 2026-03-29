import { ProjectArticle, getProjectMetadata } from "@/components/project-article";

export const metadata = getProjectMetadata("skribbl-chat");

export default function SkribblChatPage() {
  return <ProjectArticle slug="skribbl-chat" />;
}
