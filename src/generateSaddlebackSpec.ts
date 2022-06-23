import { generate, Options } from './generate';
import { OpenApi } from './openApi/v3/interfaces/OpenApi';
import { OpenApiSchema } from './openApi/v3/interfaces/OpenApiSchema';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { isString } from './utils/isString';
import { mapSwaggerRef } from './utils/mapSwaggerRef';
import { removeLodashPrefix } from './utils/removeLodashPrefix';
import { removeLodashPrefixFromRef } from './utils/removeLodashPrefixFromRef';
import { getApiToken } from './utils/saddleback/getApiToken';
import { getRequestVerificationToken } from './utils/saddleback/getRequestVerificationToken';
import { getSessionCookie } from './utils/saddleback/getSessionCookie';
import { getSwaggerJson } from './utils/saddleback/getSwaggerJson';
import { Dictionary } from './utils/types';

type Config = Options & {
    useSaddlebackServices?: boolean;
    additionalModelFileExtension?: boolean;
    additionalServiceFileExtension?: boolean;
    removeLodashPrefixes?: boolean;
};

export const generateSaddlebackSpec = async (config: Config) => {
    const username = 'roman.tech48@gmail.com';
    const password = "&cY8at<'S5PfJa#k";
    const swaggerUrl = `https://hc-workflowsservice-dev.azurewebsites.net/api-doc/v1/swagger.json`;

    const loginUrl = `https://identity-dev.saddleback.com/account/login`;
    const tokenUrl = `https://identity-dev.saddleback.com/connect/authorize/callback`;

    // params
    const client_id = 'cm';
    const response_type = 'token';
    const scope = 'cm-api.default';
    const redirect_uri = (swaggerUrl.match(new RegExp(`.*\.net`)) || [])[0] + '/api-doc-auth-callback';
    const response_mode = 'form_post';
    const state = 'e57a56201103b8bda3981515294649254a764612d871ecbe7a31efb8e3e66c8b';
    const nonce = '78fd83bf2d178a5c5de18f9f7da3269b34f7daa07d4accc28cd0bdb87f9deee8';
    const returnUrl = `/connect/authorize/callback?client_id=${client_id}&response_type=${response_type}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}&nonce=${nonce}&response_mode=${response_mode}`;

    const { requestVerificationToken, cookie } = await getRequestVerificationToken({
        url: loginUrl,
        params: { returnUrl },
    });

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

    const { data: json } = await getSwaggerJson({ url: swaggerUrl, apiToken: apiToken });

    const openApi: OpenApi = isString(config.input) ? await getOpenApiSpec(config.input) : config.input;

    if (config.removeLodashPrefixes && openApi.components && openApi.components.schemas) {
        const newSchemas: Dictionary<OpenApiSchema> = {};

        for (const schemaKey in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(schemaKey)) {
                newSchemas[removeLodashPrefix(schemaKey)] = openApi.components.schemas[schemaKey];
            }
        }

        openApi.components.schemas = newSchemas;
    }

    mapSwaggerRef(openApi, removeLodashPrefixFromRef);

    await generate({ ...config, input: openApi });
};

export default generateSaddlebackSpec;
