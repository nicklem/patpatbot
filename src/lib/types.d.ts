export type BotOutput = {
    title: string;
    summary: string;
    description: string;
};

export type DocData = Partial<BotOutput> & {
    tool: string;
    path: string;
    patternId: string;
    description: string;
};
