module.exports = {
    root: true,
    env: {
        node: true,
        jest: true,
    },
    overrides: [
        {
            files: ['*.ts'],
            parserOptions: {
                project: ['tsconfig.eslint.json'],
                tsconfigRootDir: __dirname,
                createDefaultProgram: true,
            },
            plugins: ['@darraghor/nestjs-typed'],
            rules: {
                'newline-before-return': 'error',
                'no-prototype-builtins': 'off',
                '@typescript-eslint/member-ordering': 'off',
                '@typescript-eslint/naming-convention': 'off',
                'import/no-extraneous-dependencies': 'off',
                '@typescript-eslint/brace-style': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                'brace-style': 'off',
                'import/no-cycle': 'off',
                '@angular-eslint/use-pipe-decorator': 'off',
                'import/no-commonjs': 'off',
                '@typescript-eslint/no-require-imports': 'off',
                '@typescript-eslint/no-var-requires': 'off',
                '@typescript-eslint/interface-name-prefix': 'off',
                '@darraghor/nestjs-typed/api-method-should-specify-api-response': 'off',
                '@darraghor/nestjs-typed/api-property-returning-array-should-set-array': 'off',
                '@darraghor/nestjs-typed/provided-injected-should-match-factory-parameters':
                    'error',
                '@darraghor/nestjs-typed/injectable-should-be-provided': [
                    'off',
                    {
                        src: ['src/**/*.ts'],
                        filterFromPaths: [
                            'node_modules',
                            '.test.',
                            '.spec.',
                        ],
                    },
                ],
                '@darraghor/nestjs-typed/api-property-matches-property-optionality': 'error',
                '@darraghor/nestjs-typed/controllers-should-supply-api-tags': 'error',
                '@darraghor/nestjs-typed/api-enum-property-best-practices': 'error',
                '@darraghor/nestjs-typed/should-specify-forbid-unknown-values': 'error',
                '@darraghor/nestjs-typed/param-decorator-name-matches-route-param': 'error',
                '@darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator':
                    'error',
                '@darraghor/nestjs-typed/validate-nested-of-array-should-set-each': 'error',
                '@darraghor/nestjs-typed/all-properties-are-whitelisted': 'error',
                '@darraghor/nestjs-typed/all-properties-have-explicit-defined': 'error',
                '@typescript-eslint/no-invalid-void-type': [
                    'error',
                    { allowInGenericTypeArguments: true },
                ],
            },
        },
    ],
    ignorePatterns: [
        '.eslintrc.js',
        './src/modules/lokalise/**/*.ts',
        '**/main.ts',
    ],
};
