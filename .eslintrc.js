module.exports = {
  'root': true,
  'env': {
    'browser': true,
    'es6': true
  },
  'extends': [
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaFeatures': {
      'experimentalObjectRestSpread': true,
      'jsx': true,
      'impliedStrict': true,
    },
    'sourceType': 'module'
  },
  'plugins': [
    'react',
    'react-hooks'
  ],
  'settings': {
    'react': {
      'version': 'detect'
    }
  },
  'overrides': [{
    'files': [
      '*.ts',
      '*.tsx'
    ],
    'parser': '@typescript-eslint/parser',
    'extends': [
      'plugin:@typescript-eslint/recommended',
      'plugin:import/typescript'
    ],
    'rules': {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-var': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  },
  {
    'files': [
      '*.js',
      '*.jsx'
    ],
    'extends': [
      'eslint:recommended'
    ]
  }
  ],
  'rules': {
    '@typescript-eslint/indent': ['error', 2, { SwitchCase: 1 }],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': 'warn',
    'block-spacing': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'react/prop-types': 'off',
    'no-var': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-unsafe-finally': 'warn',
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
      }
    ],
    'import/no-unresolved': 'off',
    'import/named': 'off'
  }
};