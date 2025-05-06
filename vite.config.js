module.exports = {
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('q-'),
    },
  },
};
