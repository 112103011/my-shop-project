////當 Vite 在打包網頁時，PostCSS 會把 Tailwind 的語法攔截下來，翻譯成瀏覽器看得懂的標準 CSS。

export default {
  plugins: {
    tailwindcss: {}, // 叫 Tailwind 起床工作
    autoprefixer: {}, // 自動幫你加瀏覽器前綴 (例如 -webkit-)
  },
}