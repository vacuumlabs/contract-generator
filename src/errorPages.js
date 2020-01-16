export const notEnoughRightsMessage =
  'You do not have rights to access this page.'

export const sendNotEnoughRights = (res) => {
  res.status(403).send(notEnoughRightsMessage)
}

export const sendInvalidInput = (res, message) => {
  res.status(400).send(message)
}
