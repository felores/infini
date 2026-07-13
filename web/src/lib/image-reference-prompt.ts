import type { ReferenceImage } from "@/types/image";

export function imageReferenceLabel(index: number) {
    return `Image${index + 1}`;
}

export function buildImageReferencePromptText(prompt: string, references: ReferenceImage[]) {
    const text = prompt.trim();
    if (!references.length) return text;
    const labels = references.map((_, index) => imageReferenceLabel(index));
    return `Reference image indices: ${labels.join(", ")}. Use these indices to interpret image references in the prompt.\n\n${text}`;
}
