const helmetOptions = {
    contentSecurityPolicy: {
        directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}

module.exports = helmetOptions
