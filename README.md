# Custom Saddleback OpenAPI Typescript Codegen

> For original usage read - [original README](docs/original-readme.md)

## Install

```
npm install [gitUrl] --save-dev
```

## Usage

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
