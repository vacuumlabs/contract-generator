export const sendNotEnoughRights = (res) => {
  res.statusCode = 403
  res.send('You do not have rights to access this page.')
}

export const sendInvalidInput = (res, message) => {
  res.statusCode = 400
  res.send(message)
}
