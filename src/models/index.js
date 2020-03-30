import winston from 'winston'
import Sequelize from 'sequelize'

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'sql.log' })
  ]
})

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: 'postgres',
    define: {
      underscored: true // for purpose of snake_case in names of fields in db, teamId goes to team_id (postgres naming convention)
    },
    logging: msg => logger.info(msg)
  }
)

const models = {
  User: sequelize.import('./user'),
  Message: sequelize.import('./message')
}

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models)
  }
})

export { sequelize }

export default models
