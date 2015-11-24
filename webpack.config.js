module.exports = {
  entry: {
    index: "./public/javascripts/index.js"
  },
  output: {
    path: "./public/javascripts/build",
    filename: "[name].build.js",
    chunkFilename: "[id].bundle.js"
  }
}