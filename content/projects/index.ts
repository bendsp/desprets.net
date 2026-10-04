import type { ComponentType } from "react";
import type { ProjectSlug } from "@/app/projects";
import SudokuArticle from "@/content/projects/sudoku.mdx";
import BedrockArticle from "@/content/projects/bedrock.mdx";
import DespretsNetArticle from "@/content/projects/desprets-net.mdx";
import EmojiPickerArticle from "@/content/projects/emoji-picker.mdx";
import FundamentalArticle from "@/content/projects/fundamental.mdx";
import GardenArticle from "@/content/projects/garden.mdx";
import ImagnArticle from "@/content/projects/imagn.mdx";
import RayBeamArticle from "@/content/projects/raybeam.mdx";
import SkribblChatArticle from "@/content/projects/skribbl-chat.mdx";

export const projectArticles: Record<ProjectSlug, ComponentType> = {
  sudoku: SudokuArticle,
  bedrock: BedrockArticle,
  garden: GardenArticle,
  fundamental: FundamentalArticle,
  imagn: ImagnArticle,
  "emoji-picker": EmojiPickerArticle,
  "skribbl-chat": SkribblChatArticle,
  raybeam: RayBeamArticle,
  "desprets-net": DespretsNetArticle,
};
