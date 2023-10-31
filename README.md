# ARLAS-wui-builder
Builder of ARLAS-wui 

- [Configuration](docs/arlas-wui-builder-configuration.md)

## Development
### Automatically add the copyright to the project files
In order to fix a failed 'licence" job on travis, from the root directory, run

```
npm run licence-add
```

If some new files should be ignored, add them in `license-check-and-add.json`.
Plugin documentation can be found at [https://github.com/awjh/license-check-and-add] .

