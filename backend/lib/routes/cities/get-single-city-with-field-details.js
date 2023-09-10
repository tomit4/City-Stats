'use strict'

module.exports = async (fastify, options, done) => {
    await fastify.route({
        method: 'GET',
        url: '/cities/:id/:field/:details',
        decompress: {
            forceRequestEncoding: 'gzip',
        },
        schema: {
            description:
                'returns a single city entity by id with specified field data and nested data details',
            params: {
                type: 'object',
                required: ['id', 'field', 'details'],
                properties: {
                    id: { type: 'string' },
                    field: { type: 'string' },
                    details: { type: 'string' },
                },
            },
            response: {
                200: { $ref: 'singleCityWithField#' },
            },
        },
        handler: async (request, reply) => {
            const { id, field, details } = request.params
            if (!details)
                throw Error('No nested details passed within URL string')
            const { knex, cityService } = fastify
            if (!cityService.relatedFields.includes(field))
                throw Error(
                    `Passed field '${field}' is not found in cities entity`,
                )
            reply.send(
                await cityService.grabRelDataByIdWithDeets(
                    knex,
                    id,
                    field,
                    details,
                ),
            )
        },
    })
    done()
}
