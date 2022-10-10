# Custom Saddleback OpenAPI Typescript Codegen

> For original usage read - [original README](docs/original-readme.md)

## Install

```
npm install saddleback-openapi-typescript-codegen --save-dev
```

## Step-by-step guide based on ME app
### auto fetch
1. install the package
2. create config files for every microservice that you need (put it in the root project folder for example openapiEvents.config.json)
3. inside the config file you need to specify
   1. output folder (for Events it would be ./src/shared/api/events)
   2. microservice that you're specifying ("Events")
   3. environment that using for fetch ("feature")
   4. if you don't want to generate whole microservices, you can specify filterMethod and filterArray
4. run the command where you should pass your login and pass from saddleback identity server `saddlebackApi --config openapiEvents.config.json --login login --password password`
### local swagger
1. same as above
2. same as above
3. addition specify the input path to the swagger.json file
4. run the command `saddlebackApi --config openapiEvents.config.json`

## Usage

Generated folders should be untouchable. Because every generate action will delete and put generated files into the output folder.

```
$ saddlebackOpenapi --help

  Usage: saddlebackOpenapi [options]

  Options:
    -V, --version             output the version number
    -i, --input <value>       OpenAPI specification, can be a path, url or string content
    -o, --output <value>      Output directory should end with service name workflows | events | notifications | core | journey | giving | smallGroup
    -c, --config <value>      Path to the config file
    -l, --login <value>       Login
    -p, --password <value>    Password
    -e, --environment <value> Environment dev | stage | stage2
    -s, --service <value>     Service Service Workflows | Events | Notifications | Core | Journey | Giving | SmallGroup
    -h, --help                display help for command
    -m, --filterMethod        Filter method include(default) | exclude')
    -f, --filterArray         Filter array

  Examples
    $ saddlebackOpenApi --input ./spec.json --output ./generated
    $ saddlebackOpenApi --config ./openapi.config.json
    $ saddlebackOpenApi -o "./folderPath" -l "Login" -p "Password" -e "dev" -s "core"
```

## Config file
*extends original OPTIONS*
```
    input                           required in the config or cmd arguments
    output                          required in the config or cmd arguments

    additionalModelFileExtension    optional
    additionalServiceFileExtension  optional
    removeLodashPrefixes            optional
```
### Settings:
### `input`
- Default: `undefined`
- Type: `string`

OpenAPI specification, can be a path, url or string content (required in the config or cmd arguments)

### `output`
- Default: `undefined`
- Type: `string`

Output directory (required in the config or cmd arguments)

### `login` (autofetch)
- Default: `undefined`
- Type: `string`

Login to saddleback identity server

### `password` (autofetch)
- Default: `undefined`
- Type: `string`

Password to saddleback identity server

### `environment` (autofetch)
- Default: `undefined`
- Type: `'dev' | 'stage' | 'stage2'`

Which Environment should be used for swagger.json

### `service` (autofetch)
- Default: `undefined`
- Type: `'workflows' | 'event' | 'notifications' | 'core'`

Which service should be fetched

### `filterMethod` (autofetch)
- Default: `include`
- Type: `'include' | 'exclude'`

Which method of sort should be applied to the filter array

### `filterArray` (autofetch)
- Default: `undefined`
- Type: `string[]`

Which services should be *included* or *excluded* to/from generated list

### `additionalModelFileExtension`
- Default: `true`
- Type: `boolean`

Apply `*.models.*` extension to model files.

For example (myModel.ts -> myModel.models.ts)

### `additionalServiceFileExtension`
- Default: `true`
- Type: `boolean`

Apply `*.service.*` extension to service files.

For example (myService.ts -> myService.service.ts)

### `removeLodashPrefixes`
- Default: `true`
- Type: `boolean`

Remove special prefixes that are separated by `_` at the start of names.

For example (Custom_Prefix_Name -> Name)
