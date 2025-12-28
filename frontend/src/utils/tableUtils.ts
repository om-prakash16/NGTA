export const getUniqueValues = (data: any[], key: string): string[] => {
    const values = new Set<string>();
    data.forEach(item => {
        const val = key.split('.').reduce((o, i) => o?.[i], item);
        if (val !== null && val !== undefined) {
            if (Array.isArray(val)) {
                val.forEach(v => values.add(String(v)));
            } else {
                values.add(String(val));
            }
        }
    });
    return Array.from(values).sort();
};

export const getPctColor = (val: number) => {
    if (val > 0) return "text-green-600 dark:text-green-400";
    if (val < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-400 dark:text-gray-500";
};
