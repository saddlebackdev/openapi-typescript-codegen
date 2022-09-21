'use strict';

const OpenAPI = require('../');
const fetch = require('node-fetch');

const generate = async (input, output) => {
    await OpenAPI.generate({
        input,
        output,
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: true,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
        // clientName: 'Demo',
        // indent: OpenAPI.Indent.SPACE_2,
        // postfix: 'Service',
        // request: './test/custom/request.ts',
    });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateRealWorldSpecs = async () => {
    const response = await fetch('https://api.apis.guru/v2/list.json');

    const list = await response.json();
    delete list['api.video'];
    delete list['apideck.com:vault'];
    delete list['amazonaws.com:mediaconvert'];
    delete list['bungie.net'];
    delete list['docusign.net'];
    delete list['googleapis.com:adsense'];
    delete list['googleapis.com:servicebroker'];
    delete list['kubernetes.io'];
    delete list['microsoft.com:graph'];
    delete list['presalytics.io:ooxml'];
    delete list['stripe.com'];

    const specs = Object.entries(list).map(([name, api]) => {
        const latestVersion = api.versions[api.preferred];
        return {
            name: name
                .replace(/^[^a-zA-Z]+/g, '')
                .replace(/[^\w\-]+/g, '-')
                .trim()
                .toLowerCase(),
            url: latestVersion.swaggerYamlUrl || latestVersion.swaggerUrl,
        };
    });

    for (let i = 0; i < specs.length; i++) {
        const spec = specs[i];
        await generate(spec.url, `./test/generated/${spec.name}/`);
    }
};

const main = async () => {
    // await generate('./test/spec/v2.json', './test/generated/v2/');
    // await generate('./test/spec/v3.json', './test/generated/v3/');
    const config = {
        httpClient: 'saddleback',
        clientName: '',
        useOptions: true,
        useUnionTypes: false,
        exportCore: false,
        exportServices: true,
        exportModels: true,
        exportSchemas: false,
        indent: '4',
        postfix: '',
        additionalModelFileExtension: true,
        additionalServiceFileExtension: true,
        removeLodashPrefixes: true,
        useEnvironment: 'feature',
        filterMethod: 'include',
    };
    // await OpenAPI.generateSaddlebackSpec({
    //     output: './test/auto',
    //     ...config,
    // });
    // await OpenAPI.generateSaddlebackSpec({
    //     useService: 'core',
    //     output: './auto/core',
    //     ...config,
    // });
    await OpenAPI.generateSaddlebackSpec({
        useService: 'Events',
        output: './auto2/event',
        filterMethod: "include",
        filterArray: [
            "/api/v2/event-public",
            "/api/v2/event-public/cancel-reservation",
            "/api/v2/event-public/signup",
            "/api/v2/event-public/reserve-tickets"
        ],
        ...config,
    });
    // await OpenAPI.generateSaddlebackSpec({
    //     useService: 'workflows',
    //     output: './auto/workflows',
    //     ...config,
    // });
    // await OpenAPI.generateSaddlebackSpec({
    //     useService: 'notifications',
    //     output: './auto/notifications',
    //     ...config,
    // });

    // await generateRealWorldSpecs();
};

main();
