'use strict'

const fastify = require('fastify')({ logger: true })
require('dotenv').config()
const registerPlugins = require('./lib/plugins')
const registerServices = require('./lib/services')
const registerSchemas = require('./lib/schemas')
const registerRoutes = require('./lib/routes')

const start = async () => {
    try {
        await registerPlugins(fastify)
        await registerServices(fastify)
        await registerSchemas(fastify)
        await registerRoutes(fastify)
        fastify.after(() => {
            fastify.gracefulShutdown((signal, next) => {
                next()
            })
        })
        await fastify.ready()
        fastify.swagger()
        fastify.listen({ port: process.env.PORT || 6969 })
    } catch (error) {
        fastify.log.error(error)
        process.exit(1)
    }
}

start()
