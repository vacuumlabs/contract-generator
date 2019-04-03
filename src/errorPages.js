export function sendNotFound(res) {
  res.status(404).send('Page Not Found')
}

export function sendNotEnoughRights(res) {
  res.status(401).send('You do not have rights to access this page.')
}

export function sendInvalidInput(res, message) {
  res.status(400).send(message)
}
