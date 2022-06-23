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
    useAutoCoreService?: boolean;
    useAutoEventService?: boolean;
    useAutoNotificationService?: boolean;
    useAutoWorkflowsService?: boolean;
    useEnvironment?: Environment;
};

export const generateSaddlebackSpec = async (config: Config) => {
    const saddlebackGenerator = async (input: string | Record<string, any>, output: string) => {
        const openApi: OpenApi = isString(input) ? await getOpenApiSpec(input) : input;

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

    if (!config.useEnvironment) {
        await saddlebackGenerator(config.input, config.output);
        return;
    }
    if (config.useAutoCoreService) {
        await saddlebackGenerator(
            await getSwaggerJsonByEnv({
                env: config.useEnvironment,
                service: Service.Core,
                username: config.username,
                password: config.password,
            }),
            config.output + '/core'
        );
    }
    if (config.useAutoEventService) {
        await saddlebackGenerator(
            await getSwaggerJsonByEnv({
                env: config.useEnvironment,
                service: Service.Event,
                username: config.username,
                password: config.password,
            }),
            config.output + '/event'
        );
    }
    if (config.useAutoNotificationService) {
        await saddlebackGenerator(
            await getSwaggerJsonByEnv({
                env: config.useEnvironment,
                service: Service.Notifications,
                username: config.username,
                password: config.password,
            }),
            config.output + '/notifications'
        );
    }
    if (config.useAutoWorkflowsService) {
        await saddlebackGenerator(
            await getSwaggerJsonByEnv({
                env: config.useEnvironment,
                service: Service.Workflows,
                username: config.username,
                password: config.password,
            }),
            config.output + '/workflows'
        );
    }
};

export default generateSaddlebackSpec;
