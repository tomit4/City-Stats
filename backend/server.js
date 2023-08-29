'use strict'

const fastify = require('fastify')({ logger: true })
require('dotenv').config()
const registerPlugins = require('./plugins')

const start = async () => {
    try {
        await registerPlugins(fastify)
        await fastify.ready()
        fastify.swagger()
        fastify.listen({ port: process.env.PORT })
    } catch (error) {
        fastify.log.error(error)
        process.exit(1)
    }
}

start()
