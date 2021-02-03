const cssRegex = /\.(css|less)$/; //增加less
const cssModuleRegex = /\.module\.(css|less)$/;

module.exports = {
  module: {
    rules: [
      {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: getStyleLoaders(
          {
            importLoaders: 2,// 改成2
            modules: true,//使用模块方式访问样式
            sourceMap: isEnvProduction && shouldUseSourceMap
          },
          "less-loader" //增加loader
        ),
        sideEffects: true
      },
      {
        test: cssModuleRegex,
        use: getStyleLoaders(
          {
            importLoaders: 2,
            sourceMap: isEnvProduction && shouldUseSourceMap,
            modules: true,
            getLocalIdent: getCSSModuleLocalIdent,
          },
          'less-loader'
        )
      }
    ]
  }
}
