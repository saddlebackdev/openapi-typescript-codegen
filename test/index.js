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
        username: 'roman.tech48@gmail.com',
        password: `&cY8at<'S5PfJa#k`,
        useEnvironment: 'dev',
        useAutoCoreService: true,
        useAutoEventService: false,
        useAutoNotificationService: false,
        useAutoWorkflowsService: false,
    };
    await OpenAPI.generateSaddlebackSpec({
        output: './test/auto',
        ...config,
    });
    // await OpenAPI.generateSaddlebackSpec({
    //     input: './test/spec/saddlebackCoreApi.json',
    //     output: './test/new/saddleback/core',
    //     ...config,
    // });
    // await OpenAPI.generateSaddlebackSpec({
    //     input: './test/spec/saddlebackEventApi.json',
    //     output: './test/new/saddleback/event',
    //     ...config,
    // });
    // await OpenAPI.generateSaddlebackSpec({
    //     input: './test/spec/saddlebackWebAppApi.json',
    //     output: './test/new/saddleback/web',
    //     ...config,
    // });
    // await OpenAPI.generateSaddlebackSpec({
    //     input: './test/spec/saddlebackWorkflowApi.json',
    //     output: './test/new/saddleback/workflow',
    //     ...config,
    // });

    // await generateRealWorldSpecs();
};

main();
