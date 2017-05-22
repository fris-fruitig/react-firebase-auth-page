module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'ReactFirebaseAuthPage',
      externals: {
        react: 'React'
      }
    }
  }
}
