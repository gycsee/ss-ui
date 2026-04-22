import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  declaration: false,
  entries: [
    {
      builder: 'mkdist',
      format: 'esm',
      input: './src',
      loaders: ['js'],
      pattern: ['**/*.js'],
    },
    {
      builder: 'mkdist',
      format: 'esm',
      input: './src',
      pattern: ['**/*.css'],
    },
  ],
});
