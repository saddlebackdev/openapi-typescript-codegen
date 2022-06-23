import axios, { AxiosResponse } from 'axios';

export const getSwaggerJson = async ({
    url,
    apiToken,
}: {
    url: string;
    apiToken: string;
}): Promise<AxiosResponse | null> => {
    const response = await axios(url, {
        method: 'GET',
        headers: {
            Cookie: `apiKey=${apiToken}`,
        },
        maxRedirects: 0,
    }).catch(e => console.log(e));

    return response ?? null;
};
