const path = require('path')

module.exports = {
    mode: 'development',
    entry: tryWithModule('solid-js', './src/main.tsx', './src/main.ts'),
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/i,
                exclude: /node_modules/,
                use: tryWithModule('solid-js', [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['solid']
                        }
                    },
                    'ts-loader',
                ], 'ts-loader'),
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpe?g)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.txt$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(ttf|otf)/i,
                type: 'asset/resource',
            },
            tryWithModule('sass', {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            }, undefined),
        ].filter(use => use !== undefined),
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
}

function tryWithModule(testModule, onOk, onError) {
    function callIfFunction(value) {
        return (typeof value == 'function') ? value() : value
    }
    if (typeof testModule == 'string') {
        try {
            require.resolve(testModule)
            return callIfFunction(onOk)
        }
        catch {
            return callIfFunction(onError)
        }
    }
    else {
        let isFound = false
        for (const module of testModule) {
            try {
                require.resolve(module)
                isFound = true
                break
            }
            catch { }
        }
        return callIfFunction(isFound ? onOk : onError)
    }
}
