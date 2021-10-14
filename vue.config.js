module.exports = {
  configureWebpack: {
    devtool: 'source-map',
  },
  pages: {
    index: {
      entry: 'src/main.ts',
      title: 'DiaGen | ダイヤグラム作成サポートツール',
    },
  },
};
