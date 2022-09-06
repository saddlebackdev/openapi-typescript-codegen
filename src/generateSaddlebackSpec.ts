import { generate, Options } from './generate';
import { OpenApi } from './openApi/v3/interfaces/OpenApi';
import { OpenApiOperation } from './openApi/v3/interfaces/OpenApiOperation';
import { OpenApiParameter } from './openApi/v3/interfaces/OpenApiParameter';
import { OpenApiSchema } from './openApi/v3/interfaces/OpenApiSchema';
import { OpenApiServer } from './openApi/v3/interfaces/OpenApiServer';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { isString } from './utils/isString';
import { mapSwaggerRef } from './utils/mapSwaggerRef';
import { removeLodashPrefix } from './utils/removeLodashPrefix';
import { removeLodashPrefixFromRef } from './utils/removeLodashPrefixFromRef';
import { getSchemaRefFromContent } from './utils/saddleback/getSchemaRefFromContent';
import { getSwaggerJsonByEnv } from './utils/saddleback/getSwaggerJsonByEnv';
import { Environment, Service } from './utils/saddleback/getUrlByServiceEnv';
import { recursiveAddAllUnknownModels } from './utils/saddleback/recursiveAddAllUnknownModels';
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
    filterMethod: 'include' | 'exclude';
    filterArray: string[];
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

    const list: OpenApi = openApi;

    if (!config.filterArray || config.filterArray.length === 0) {
        await generate({ ...config, input: list });
        return;
    }

    const requiredPaths: OpenApi['paths'] = {};

    for (const path in list.paths) {
        if (!list.paths.hasOwnProperty(path)) return;

        if (config.filterMethod === 'include') {
            if (config.filterArray.some(it => it === path)) requiredPaths[path] = list.paths[path];
        }
        if (config.filterMethod === 'exclude') {
            if (!config.filterArray.some(it => it === path)) requiredPaths[path] = list.paths[path];
        }
    }

    const requiredSchemasSet: Set<string> = new Set();

    for (const pathName in requiredPaths) {
        const pathElement = requiredPaths[pathName];

        const openApiPathValues = Object.values(pathElement) as (
            | OpenApiOperation
            | OpenApiServer
            | OpenApiParameter
            | string
        )[];

        openApiPathValues.forEach(requestMethodData => {
            if (typeof requestMethodData !== 'string') {
                if (!('url' in requestMethodData)) {
                    if ('parameters' in requestMethodData) {
                        // add schemas from {apiPath}/{method}/parameters
                        requestMethodData.parameters?.forEach(parameter => {
                            const modelName = getSchemaRefFromContent(parameter);

                            requiredSchemasSet.add(modelName);
                            recursiveAddAllUnknownModels(modelName, openApi, requiredSchemasSet);
                        });
                    }
                    if ('responses' in requestMethodData) {
                        const responsesCodeData = Object.values(requestMethodData.responses);

                        responsesCodeData.forEach(response => {
                            const contentTypeData = Object.values(response.content ?? {});

                            // add schemas from {apiPath}/{method}/responses/{responseType}/content
                            contentTypeData.forEach(content => {
                                const modelName = getSchemaRefFromContent(content);

                                requiredSchemasSet.add(getSchemaRefFromContent(content));
                                recursiveAddAllUnknownModels(modelName, openApi, requiredSchemasSet);
                            });
                        });
                    }
                    if ('requestBody' in requestMethodData) {
                        const requestBodyContent = Object.values(requestMethodData.requestBody?.content ?? {});

                        // add schemas from {apiPath}/{method}/responses/{responseType}/requestBody/content
                        requestBodyContent.forEach(content => {
                            const modelName = getSchemaRefFromContent(content);

                            requiredSchemasSet.add(getSchemaRefFromContent(content));
                            recursiveAddAllUnknownModels(modelName, openApi, requiredSchemasSet);
                        });
                    }
                }
            }
        });
    }

    const requiredSchemas: Dictionary<OpenApiSchema> = {};

    if (list && list.components && list.components.schemas) {
        for (const schema in list.components.schemas) {
            if (requiredSchemasSet.has(schema)) {
                requiredSchemas[schema] = list.components.schemas[schema];
            }
        }
    }

    const listWithRequiredPaths: OpenApi = {
        ...list,
        paths: requiredPaths,
        components: {
            schemas: requiredSchemas,
        },
    };

    await generate({ ...config, input: listWithRequiredPaths });
};

export default generateSaddlebackSpec;
