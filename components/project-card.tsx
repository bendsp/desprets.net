"use client";

import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

import { Project } from "@/app/projects";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative z-0 hover:z-10"
    >
      <Card className="h-full transition-all duration-300 pt-[1px] py-0 gap-0 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 relative">
        <Link href={`/projects/${project.slug}`}>
          <div className="w-full aspect-[4/3] bg-muted relative overflow-hidden cursor-pointer">
            <Image
              src={project.images[0] || "/placeholder.svg"}
              alt={`${project.title} screenshot`}
              fill
              className="object-cover object-top"
            />
          </div>
        </Link>
        <CardContent className="p-6 flex flex-col flex-1">
          <h3
            className="text-xl font-bold mb-2 overflow-hidden text-ellipsis whitespace-nowrap"
            title={project.title}
          >
            {project.title}
          </h3>
          <p
            className="text-muted-foreground mb-4 min-h-[3rem] overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
            title={project.description}
          >
            {project.description}
          </p>

          <div className="flex justify-between items-center mt-auto">
            <div className="flex space-x-3">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <Github size={20} />
                </a>
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <ExternalLink size={20} />
                </a>
              )}
            </div>
            <Link href={`/projects/${project.slug}`}>
              <Button size="sm">Learn More</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
