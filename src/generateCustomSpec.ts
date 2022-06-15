import { generate, Options } from './generate';
import { OpenApi } from './openApi/v3/interfaces/OpenApi';
import { OpenApiMediaType } from './openApi/v3/interfaces/OpenApiMediaType';
import { OpenApiOperation } from './openApi/v3/interfaces/OpenApiOperation';
import { OpenApiParameter } from './openApi/v3/interfaces/OpenApiParameter';
import { OpenApiSchema } from './openApi/v3/interfaces/OpenApiSchema';
import { OpenApiServer } from './openApi/v3/interfaces/OpenApiServer';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { Dictionary } from './utils/types';

type Config = Options & {
    filterMethod: 'greedy' | 'ascetic';
    filterArray: string[];
    input: string;
    useSaddlebackServices?: boolean;
};

export const generateCustomSpec = async (config: Config) => {
    const getNameFromRef = (ref: string): string => {
        return ref.split('/').slice(-1)[0];
    };

    const getSchemaRefFromContent = (content: OpenApiMediaType): string => {
        let ref: string = '';

        ref = content.$ref || content.schema?.$ref || content.schema?.items?.$ref || '';

        return getNameFromRef(ref);
    };

    const recursiveAddAllUnknownModels = (modelName: string): void => {
        const model = list.components?.schemas ? list.components.schemas[modelName] : undefined;
        if (model === undefined) return;

        for (const property in model.properties) {
            const ref = model.properties[property].$ref || model.properties[property].items?.$ref || '';
            const modelName = getNameFromRef(ref);

            if (!requiredSchemasSet.has(modelName)) {
                requiredSchemasSet.add(modelName);
                recursiveAddAllUnknownModels(modelName);
            }
        }
    };

    const list: OpenApi = await getOpenApiSpec(config.input);

    // const filterArray: string[] = ['/api/agreement', '/api/agreement/{id}'];

    const requiredPaths: OpenApi['paths'] = {};

    for (const path in list.paths) {
        if (!list.paths.hasOwnProperty(path)) return;

        if (config.filterMethod === 'ascetic') {
            if (config.filterArray.some(it => it === path)) requiredPaths[path] = list.paths[path];
        }
        if (config.filterMethod === 'greedy') {
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
                            recursiveAddAllUnknownModels(modelName);
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
                                recursiveAddAllUnknownModels(modelName);
                            });
                        });
                    }
                    if ('requestBody' in requestMethodData) {
                        const requestBodyContent = Object.values(requestMethodData.requestBody?.content ?? {});

                        // add schemas from {apiPath}/{method}/responses/{responseType}/requestBody/content
                        requestBodyContent.forEach(content => {
                            const modelName = getSchemaRefFromContent(content);

                            requiredSchemasSet.add(getSchemaRefFromContent(content));
                            recursiveAddAllUnknownModels(modelName);
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

export default generateCustomSpec;
