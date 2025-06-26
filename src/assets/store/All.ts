import { create } from 'zustand';

export const useActivePaletteStore = create(() => ({
    palette : {
        income: {
            button:"text-[#DF2121] bg-[#FFC2C2]",
            text:"text-[#DF2121]",
        },
        export: {
            button:"text-[#1E82AC] bg-[#C1F6FF]",
            text:"text-[#1E82AC]",
        },
    }
}));