import axios, { AxiosError } from 'axios';
import FormData from 'form-data';

export const getSessionCookie = async ({
    username,
    password,
    requestVerificationToken,
    url,
    params,
    cookie,
}: {
    username: string;
    password: string;
    requestVerificationToken: string;
    url: string;
    params: Record<string, string>;
    cookie: string;
}): Promise<{ cookie: string }> => {
    let cookieString = '';

    try {
        const form = new FormData();
        form.append('Username', username);
        form.append('Password', password);
        form.append('__RequestVerificationToken', requestVerificationToken);

        const response = await axios(`${url}`, {
            method: 'POST',
            data: form,
            params,
            headers: {
                Cookie: cookie,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            maxRedirects: 0,
        });
    } catch (e) {
        const error = e as AxiosError;
        if (error.response && error.response.status === 302) {
            const cookies = error.response?.headers['set-cookie'] || [];
            cookieString = cookies.reduce((acc, it) => `${acc}${it};`, '') || '';
        } else {
            throw new Error('Wrong response getSessionCookie');
        }
    } finally {
        if (cookieString.length === 0) throw new Error('Wrong cookies getSessionCookie');

        return { cookie: cookieString };
    }
};
