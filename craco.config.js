const { whenProd } = require('@craco/craco')

module.exports = {
    ...whenProd(() => ({
        webpack: {
            configure: {
                target: 'electron-renderer'
            }
        }
    }), {}),
    style: {
        postcss: {
            plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
            ],
        },
    },
}