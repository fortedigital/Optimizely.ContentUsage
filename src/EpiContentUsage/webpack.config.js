const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
    return {
        entry: {
            'epi-content-usage': './Frontend/index.tsx'
        },
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
            static: path.resolve(__dirname, 'module/ClientResources')
        },
        plugins: [
            new MiniCssExtractPlugin({
              filename: "[name].bundle.css",
            }),
        ]
    }
};
