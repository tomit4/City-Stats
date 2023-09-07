'use strict'
const fastify = require('fastify')()
const test = require('ava')
const fp = require('fastify-plugin')
const knexFile = require('../../knexfile').development
const knex = require('knex')(knexFile)
const StatesService = require('../../lib/services/states/states-services')
const mock = require('../mocks/mock_get-single-state-with-field_senators.json')

const statesPlugin = (fastify, options, done) => {
    if (!fastify.states) {
        const stateService = new StatesService()
        fastify.decorate('stateService', stateService)
    }
    done()
}

const knexPlugin = (fastify, options, done) => {
    if (!fastify.knex) {
        fastify.decorate('knex', knex)
    }
    done()
}

const registerPlugins = async fastify => {
    const statePlug = fp(statesPlugin, { name: 'fastify-states-plugin' })
    const knexPlug = fp(knexPlugin, { name: 'fastify-knex-plugin' })
    await fastify.register(statePlug)
    await fastify.register(knexPlug)
}

const registerRoute = async fastify => {
    const newRoute = async fastify => {
        await fastify.route({
            method: 'GET',
            url: '/states/:id/:field',
            handler: async (request, reply) => {
                const { id } = request.params
                const { knex, stateService } = fastify
                reply.send(await stateService.grabSingleStateById(knex, id))
            },
        })
    }
    fastify.register(newRoute)
}

test('requests the /states route with param id of 5 and field of senators', async t => {
    t.plan(3)
    await registerPlugins(fastify)
    await registerRoute(fastify)
    await fastify.listen()
    await fastify.ready()

    const response = await fastify.inject({
        method: 'GET',
        url: '/states/5/senators',
    })

    t.is(response.statusCode, 200)
    t.is(response.headers['content-type'], 'application/json; charset=utf-8')
    t.is(response.payload, mock)
    await fastify.close()
})
