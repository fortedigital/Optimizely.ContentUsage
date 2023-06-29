const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
    return {
        entry: {
            'forte-optimizely-content-usage': './Frontend/index.tsx'
        },
        devtool: 'cheap-module-source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    loader: 'ts-loader'
                },
                {
                  test: /\.css$/i,
                  use: [MiniCssExtractPlugin.loader, "css-loader"],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "sass-loader"
                    ],
                },
            ]
        },
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'module/ClientResources')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        devServer: {
            static: path.resolve(__dirname, 'module/ClientResources'),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            }
        },
        plugins: [
            new MiniCssExtractPlugin({
              filename: "[name].bundle.css",
            }),
        ]
    }
};
