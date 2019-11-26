import _ from 'lodash'

export const objToAdocVars = (vars, id) => {
  const missingVars = _.reduce(
    vars,
    (acc, val, key) => (val == null ? [...acc, key] : acc),
    [],
  )
  if (!_.isEmpty(missingVars)) {
    const message =
      `There are missing variables for ${id}:` +
      missingVars.map((mv) => '<br>' + mv)
    throw message
  }

  return _.map(vars, (val, key) => `:${key}: ${val}\n`).join('')
}
