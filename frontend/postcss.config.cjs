module.exports = {
  // 使用数组形式以支持需要函数形式的插件
  plugins: [
    require('postcss-import'),
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}