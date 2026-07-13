import { FileText, ImagePlus, Images, Maximize2, Settings2, Video } from "lucide-react";

export const navigationTools = [
    {
        slug: "canvas",
        label: "My Canvas",
        icon: Maximize2,
    },
    {
        slug: "image",
        label: "Image Workbench",
        icon: ImagePlus,
    },
    {
        slug: "video",
        label: "Video Workbench",
        icon: Video,
    },
    {
        slug: "prompts",
        label: "Prompt Library",
        icon: FileText,
    },
    {
        slug: "assets",
        label: "My Assets",
        icon: Images,
    },
    {
        slug: "config",
        label: "Settings",
        icon: Settings2,
    },
] as const;

export type NavigationToolSlug = (typeof navigationTools)[number]["slug"];
