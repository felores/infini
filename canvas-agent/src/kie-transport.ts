import { CONTRACT_VERSION, PACKAGE_VERSION, createKieOpenAiRouter, type KieOpenAiRouter } from "@felores/kie-ai-openai-server";

export type KieTransportInfo = {
    configured: boolean;
    packageVersion: string;
    contractVersion: string;
};

export function kieTransportInfo(): KieTransportInfo {
    return {
        configured: Boolean(process.env.KIE_AI_API_KEY),
        packageVersion: PACKAGE_VERSION,
        contractVersion: CONTRACT_VERSION,
    };
}

export function loadKieTransport(): KieOpenAiRouter | null {
    if (!process.env.KIE_AI_API_KEY) return null;
    return createKieOpenAiRouter({
        apiKey: process.env.KIE_AI_API_KEY,
        baseUrl: process.env.KIE_AI_BASE_URL,
        dataDir: process.env.KIE_AI_DATA_DIR,
    });
}
