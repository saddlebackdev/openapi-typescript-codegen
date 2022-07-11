import { generate, Options } from './generate';
import { OpenApi } from './openApi/v3/interfaces/OpenApi';
import { OpenApiSchema } from './openApi/v3/interfaces/OpenApiSchema';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { isString } from './utils/isString';
import { mapSwaggerRef } from './utils/mapSwaggerRef';
import { removeLodashPrefix } from './utils/removeLodashPrefix';
import { removeLodashPrefixFromRef } from './utils/removeLodashPrefixFromRef';
import { getSwaggerJsonByEnv } from './utils/saddleback/getSwaggerJsonByEnv';
import { Environment, Service } from './utils/saddleback/getUrlByServiceEnv';
import { Dictionary } from './utils/types';

type Config = Options & {
    useSaddlebackServices?: boolean;
    additionalModelFileExtension?: boolean;
    additionalServiceFileExtension?: boolean;
    removeLodashPrefixes?: boolean;
    username: string;
    password: string;
    useEnvironment?: Environment;
    useService?: Service;
};

export const generateSaddlebackSpec = async (config: Config) => {
    const openApi: OpenApi =
        config.useEnvironment && config.useService
            ? await getSwaggerJsonByEnv({
                  env: config.useEnvironment,
                  service: config.useService,
                  username: config.username,
                  password: config.password,
              })
            : isString(config.input)
            ? await getOpenApiSpec(config.input)
            : config.input;

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
