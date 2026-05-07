import type { ComponentType } from "react";
import type { ProjectSlug } from "@/app/projects";
import BedrockArticle from "@/content/projects/bedrock.mdx";
import DespretsNetArticle from "@/content/projects/desprets-net.mdx";
import EmojiPickerArticle from "@/content/projects/emoji-picker.mdx";
import FundamentalArticle from "@/content/projects/fundamental.mdx";
import ImagnArticle from "@/content/projects/imagn.mdx";
import RayBeamArticle from "@/content/projects/raybeam.mdx";
import SkribblChatArticle from "@/content/projects/skribbl-chat.mdx";

export const projectArticles: Record<ProjectSlug, ComponentType> = {
  bedrock: BedrockArticle,
  fundamental: FundamentalArticle,
  imagn: ImagnArticle,
  "emoji-picker": EmojiPickerArticle,
  "skribbl-chat": SkribblChatArticle,
  raybeam: RayBeamArticle,
  "desprets-net": DespretsNetArticle,
};
