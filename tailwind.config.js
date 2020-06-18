module.exports = {
  purge: {
    enabled: true,
    mode: "postcss",
    content: ["./src/**/*.html", "./src/**/*.ts", "./src/**/*.tsx"],
    whitelist: ["body", "html", "svg"],
    whitelistPatterns: [/Toastify.+/],
  },
}
