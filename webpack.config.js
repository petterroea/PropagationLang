const path = require('path');

module.exports = {
    entry: path.join(__dirname, "src", '/web.ts'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, "dist"),
        libraryTarget: "var",
        library: "PropagationLang"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
};