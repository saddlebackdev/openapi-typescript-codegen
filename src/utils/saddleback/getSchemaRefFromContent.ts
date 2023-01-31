import { OpenApiMediaType } from '../../openApi/v3/interfaces/OpenApiMediaType';
import { getNameFromRef } from './getNameFromRef';

export const getSchemaRefFromContent = (content: OpenApiMediaType): string => {
    let ref: string = '';

    ref = content.$ref || content.schema?.$ref || content.schema?.items?.$ref || '';

    return getNameFromRef(ref);
};
