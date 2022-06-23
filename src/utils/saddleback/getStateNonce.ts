import axios, { AxiosError } from 'axios';

export const getStateNonce = async ({
    url,
}: {
    url: string;
}): Promise<{ state: string | null; nonce: string | null }> => {
    let [state, nonce]: [string | null, string | null] = [null, null];

    const response = await axios(`https://${url.match(new RegExp('(.*)/api-doc/'))?.[0]}`, {
        method: 'GET',
        maxRedirects: 0,
    }).catch(e => {
        const response = e as AxiosError;

        if (response.response && response.response.status === 302) {
            const location = response.response.headers?.Location || '';

            const newRegexp = new RegExp(`state=(.*)&nonce=(.*)[&$]`);
            [state, nonce] = location.match(newRegexp)?.slice(1) || [null, null];
        }
    });

    return { state, nonce };
};
