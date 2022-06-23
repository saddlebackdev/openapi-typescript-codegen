import { getApiToken } from './getApiToken';
import { getRequestVerificationToken } from './getRequestVerificationToken';
import { getSessionCookie } from './getSessionCookie';
import { getStateNonce } from './getStateNonce';
import { getSwaggerJson } from './getSwaggerJson';
import { Environment, getUrlByServiceEnv, Service } from './getUrlByServiceEnv';

export const getSwaggerJsonByEnv = async ({
    env,
    service,
    username,
    password,
}: {
    env: Environment;
    service: Service;
    username: string;
    password: string;
}): Promise<any> => {
    const swaggerUrl = getUrlByServiceEnv({ env, service });
    const loginUrl = `https://identity-dev.saddleback.com/account/login`;
    const tokenUrl = `https://identity-dev.saddleback.com/connect/authorize/callback`;

    // params
    const client_id = 'cm';
    const response_type = 'token';
    const scope = 'cm-api.default';
    const redirect_uri = (swaggerUrl.match(new RegExp(`.*\.net`)) || [])[0] + '/api-doc-auth-callback';
    const response_mode = 'form_post';

    const { state, nonce } = await getStateNonce({ url: swaggerUrl });

    if (!state || !nonce) return null;

    // const state = 'e57a56201103b8bda3981515294649254a764612d871ecbe7a31efb8e3e66c8b';
    // const nonce = '78fd83bf2d178a5c5de18f9f7da3269b34f7daa07d4accc28cd0bdb87f9deee8';
    const returnUrl = `/connect/authorize/callback?client_id=${client_id}&response_type=${response_type}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}&nonce=${nonce}&response_mode=${response_mode}`;

    const { requestVerificationToken, cookie } = await getRequestVerificationToken({
        url: loginUrl,
        params: { returnUrl },
    });

    if (!requestVerificationToken || !cookie) return null;

    const { cookie: sessionCookie } = await getSessionCookie({
        url: loginUrl,
        username,
        password,
        cookie,
        requestVerificationToken,
        params: { returnUrl },
    });

    const { apiToken } = await getApiToken({
        url: tokenUrl,
        cookie: sessionCookie,
        params: {
            client_id,
            response_type,
            scope,
            redirect_uri,
            state,
            nonce,
            response_mode,
        },
    });

    if (!apiToken) return null;

    const response = await getSwaggerJson({ url: swaggerUrl, apiToken: apiToken });

    if (!response) return null;

    return response.data;
};
