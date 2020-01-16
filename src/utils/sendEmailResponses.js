import _ from 'lodash'

export const sendEmailResponses = (res, responses) => {
  const failedResponses = responses.filter((r) => r.status !== 200)

  return res.send(
    _.isEmpty(failedResponses)
      ? 'Contracts successfully uploaded and sent'
      : `Some contracts were uploaded but emailing failed:<br>${failedResponses
          .map((r) => r.response)
          .join('<br>')}`,
  )
}
