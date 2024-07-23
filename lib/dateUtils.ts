export const getFirstDayOfCurrentYear = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1);
};

export const getLastDayOfCurrentYear = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), 11, 31);
};
