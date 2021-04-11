module.exports = {
	'env': {
		'browser': true,
		'node': true,
		'es6': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:react/recommended'
	],
	'parserOptions': {
		'sourceType': 'module',
		'allowImportExportEverywhere': true,
		'ecmaVersion': 11,
		'ecmaFeatures': {
			'modules': true,
			'jsx': true
		}
	},
	'settings': {
		'react': {
			'pragma': 'h',
			'version': '15'
		}
	},
	'plugins': [
		'import',
		'react'
	],
	'rules': {
		'react/jsx-key': [ 'off' ],
		'react/no-direct-mutation-state': [ 'off' ],
		'react/no-unescaped-entities': [ 'off' ],
		'react/no-unknown-property': [ 'off' ],
		'react/react-in-jsx-scope': [ 'off' ],
		'react/prop-types': [ 'off' ],
		'react/no-string-refs': [ 'off' ],
		'react/display-name': [ 'off' ],

		'react/jsx-first-prop-new-line': [ 1, 'multiline' ],
		'react/jsx-max-props-per-line': [ 1,
			{
				'maximum': 1
			}
		],

		'react/jsx-closing-bracket-location': [ 1, 'line-aligned' ],

		"array-bracket-spacing": [ "error", "always", {
			"singleValue": true,
			"arraysInArrays": false
		} ],
		"block-spacing": [ "error", "always" ],
		"brace-style": [ "error", "1tbs", {
			"allowSingleLine": true
		} ],
		"comma-spacing": [ "error", {
			"before": false,
			"after": true
		} ],
		"comma-style": [ 2, "last" ],
		"computed-property-spacing": [ "error", "always" ],
		"eol-last": [ "error", "always" ],
		"func-call-spacing": [ "error", "never" ],
		"indent": [ "error", "tab", {
			"SwitchCase": 1
		} ],
		"key-spacing": [ "error", {
			"beforeColon": false
		} ],

		"keyword-spacing": [ "error", {
			"before": true,
			"after": true
		} ],


		"max-len": [ "error", {
			"code": 300,
			"ignoreStrings": true
		} ],

		"new-parens": [ "error" ],

		"no-case-declarations": 0,
		"no-cond-assign": 0,
		"no-console": 0,
		"no-debugger": 0,
		"no-extra-semi": 1,

		"no-multi-spaces": 2,
		"no-trailing-spaces": [ "error", {
			"skipBlankLines": false
		} ],
		"no-undef": 0,
		"no-unused-vars": 1,
		"no-var": 1,
		"no-whitespace-before-property": [ "error" ],

		"object-curly-spacing": [ "error", "always" ],

		"padded-blocks": [ "error", {
			"blocks": "never", // TESTING (original is always)
			"switches": "never", // TESTING (original is always)
			"classes": "never" // TESTING (original is always)
		} ],
		"prefer-const": [ "error", {
			"destructuring": "any",
			"ignoreReadBeforeAssign": false
		} ],

		"semi": [ "error", "always", {
			"omitLastInOneLineBlock": true
		} ],
		"semi-spacing": [ "error", {
			"before": false,
			"after": true
		} ],
		"space-before-blocks": [ "error", {
			"functions": "always",
			"keywords": "always",
			"classes": "always"
		} ],
		"space-before-function-paren": [ "error", {
			"anonymous": "always",
			"named": "never",
			"asyncArrow": "ignore"
		} ],

		"space-in-parens": [ "error", "never" ], // TESTING (original is always)
		"space-infix-ops": [ "error" ],
		"space-unary-ops": [ "error", {
			"words": true,
			"nonwords": false
		} ],

		"template-curly-spacing": [ "error", "always" ]

	}
};
