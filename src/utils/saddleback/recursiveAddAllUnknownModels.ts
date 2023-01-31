import { OpenApi } from '../../openApi/v3/interfaces/OpenApi';
import { getNameFromRef } from './getNameFromRef';

export const recursiveAddAllUnknownModels = (
    modelName: string,
    openApi: OpenApi,
    requiredSchemasSet: Set<string>
): void => {
    const model = openApi.components?.schemas ? openApi.components.schemas[modelName] : undefined;
    if (model === undefined) return;

    for (const property in model.properties) {
        const ref = model.properties[property].$ref || model.properties[property].items?.$ref || '';
        const modelName = getNameFromRef(ref);

        if (!requiredSchemasSet.has(modelName)) {
            requiredSchemasSet.add(modelName);
            recursiveAddAllUnknownModels(modelName, openApi, requiredSchemasSet);
        }
    }
};
