'use strict'

const rTracer = require('../index')

// first - configure winston logger

const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format

// a custom format that outputs request id
const rTracerFormat = printf((info) => {
  const rid = rTracer.id()
  return rid
    ? `${info.timestamp} [request-id:${rid}]: ${info.message}`
    : `${info.timestamp}: ${info.message}`
})

const logger = createLogger({
  format: combine(
    timestamp(),
    rTracerFormat
  ),
  transports: [new transports.Console()]
})

// next - configure and start Koa app

const Koa = require('koa')
const app = new Koa()

app.use(rTracer.koaMiddleware())

app.use(async (ctx) => {
  logger.info('Starting request handling')
  const result = await fakeDbAccess()
  ctx.body = result
})

async function fakeDbAccess () {
  return new Promise((resolve) => {
    setTimeout(() => {
      logger.info('Logs from fakeDbAccess')
      resolve({ message: 'Hello from cls-rtracer Koa example' })
    }, 0)
  })
}

app.listen(3000, (err) => {
  if (err) {
    logger.err('The app could not start')
  }
  logger.info('The app is listening on 3000')
})
