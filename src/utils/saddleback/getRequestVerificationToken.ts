import axios from 'axios';

export const getRequestVerificationToken = async ({
    url,
    params,
}: {
    url: string;
    params: Record<string, string>;
}): Promise<{ requestVerificationToken: string; cookie: string }> => {
    const response0 = await axios(url, {
        method: 'GET',
        params,
        maxRedirects: 0,
    });
    const regexp = new RegExp(`<input name="__RequestVerificationToken" type="hidden" value="(.*)"`);
    const requestVerificationToken = response0.data.match(regexp)?.[1] || null;

    const cookies = response0.headers['set-cookie'];
    const cookieString = cookies?.reduce((acc, it) => `${acc}${it};`, '') || null;

    if (!requestVerificationToken || !cookieString) throw new Error('getRequestVerificationToken failed');

    return {
        cookie: cookieString,
        requestVerificationToken,
    };
};
