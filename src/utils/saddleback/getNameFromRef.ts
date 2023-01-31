export const getNameFromRef = (ref: string): string => {
    return ref.split('/').slice(-1)[0];
};
