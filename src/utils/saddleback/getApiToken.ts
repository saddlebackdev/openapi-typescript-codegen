import axios from 'axios';

export const getApiToken = async ({
    url,
    cookie,
    params,
}: {
    url: string;
    cookie: string;
    params: Record<string, string>;
}): Promise<{ apiToken: string | null }> => {
    const response = await axios(url, {
        method: 'GET',
        headers: {
            Cookie: cookie,
        },
        params,
        maxRedirects: 0,
    }).catch(e => console.log(e));

    if (!response) return { apiToken: null };

    const regexp = new RegExp(`type='hidden' name='access_token' value='(.*)'`);
    const apiToken = response.data.match(regexp)?.[1] || null;

    if (apiToken === null) throw new Error('wrong apiToken getApiToken');

    return { apiToken };
};
