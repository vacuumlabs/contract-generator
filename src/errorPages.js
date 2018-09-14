export function sendNotFound(res) {
  res.status(404).send('Page Not Found')
}

export function sendNotEnoughRights(res) {
  res.status(401).send('You do not have rights to access this page.')
}
