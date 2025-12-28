import { cn } from "@/lib/utils";

interface StrengthMeterProps {
    label?: string;
    buyerScore?: number;
    sellerScore?: number;
}

export function StrengthMeter({ label, buyerScore, sellerScore }: StrengthMeterProps) {
    // If scores are provided, use them for the ratio
    // If not, infer 100% based on label
    let bScore = buyerScore;
    let sScore = sellerScore;

    if (bScore === undefined || sScore === undefined) {
        if (label === "Buyers Dominating" || label === "Buyers") { bScore = 100; sScore = 0; }
        else if (label === "Sellers Dominating" || label === "Sellers") { bScore = 0; sScore = 100; }
        else { bScore = 50; sScore = 50; }
    }

    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700">
                <div className="bg-green-500 dark:bg-green-400 h-full transition-all duration-300" style={{ width: `${bScore}%` }} />
                <div className="bg-red-500 dark:bg-red-400 h-full transition-all duration-300" style={{ width: `${sScore}%` }} />
            </div>
            <div className="flex justify-between text-[10px] font-medium leading-none">
                <span className={cn("text-green-600 dark:text-green-400", bScore! > sScore! ? "font-bold" : "opacity-90")}>
                    {bScore! > sScore! ? "Buyers" : ""}
                </span>
                <span className={cn("text-red-600 dark:text-red-400", sScore! > bScore! ? "font-bold" : "opacity-90")}>
                    {sScore! > bScore! ? "Sellers" : ""}
                </span>
                {bScore === sScore && <span className="text-gray-500 dark:text-gray-400">Balanced</span>}
            </div>
        </div>
    );
}
