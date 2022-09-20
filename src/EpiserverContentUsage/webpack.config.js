const path = require('path');

module.exports = (env, argv) => {
    return {
        entry: {
            'react-app': './Frontend/index.tsx'
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
                  use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        "style-loader",
                        "css-loader",
                        {
                            loader: "sass-loader",
                            options: {
                                includePaths: ["node_modules"],
                            },
                        },
                    ],
                },
            ]
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'wwwroot')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        }
    }
}