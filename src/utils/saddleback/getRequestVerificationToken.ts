import axios from 'axios';

export const getRequestVerificationToken = async ({
    url,
    params,
}: {
    url: string;
    params: Record<string, string>;
}): Promise<{
    requestVerificationToken: string | null;
    cookie: string | null;
}> => {
    const response = await axios(url, {
        method: 'GET',
        params,
        maxRedirects: 0,
    }).catch(e => console.log(e));

    if (!response) return { requestVerificationToken: null, cookie: null };

    const regexp = new RegExp(`<input name="__RequestVerificationToken" type="hidden" value="(.*)"`);
    const requestVerificationToken = response.data.match(regexp)?.[1] || null;

    const cookies = response?.headers['set-cookie'];
    const cookieString = cookies?.reduce((acc, it) => `${acc}${it};`, '') || null;

    if (!requestVerificationToken || !cookieString) throw new Error('getRequestVerificationToken failed');

    return {
        cookie: cookieString,
        requestVerificationToken,
    };
};
