# Whaler UI

This is the visual disk-usage analyser frontend for [whaler](https://github.com/treebeardtech/whaler)

## Developing

```
yarn install
```

```
du -k -a . > public/du.txt # generate test data
```

```
yarn start
```

## Testing with Whaler CLI

```
yarn dist
cp dist/html.tgz ../${WHALER}/src/whaler/static
```
