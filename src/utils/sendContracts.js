import archiver from 'archiver'

const createZip = async (contracts, people) => {
  const zip = archiver('zip', {
    zlib: {level: 9},
  })

  contracts.forEach((contract, i) => {
    zip.append(contract, {name: `${people[i].jiraId}.pdf`})
  })

  const finishZipping = new Promise((res, rej) =>
    zip.on('finish', () => res(1)),
  )
  zip.finalize()
  await finishZipping

  return zip.read()
}

const sendSingleContract = (res, contract) => {
  res.setHeader('Content-Type', `application/pdf`)
  return res.send(contract)
}

const zipAndSendContracts = async (res, people, contracts) => {
  const zippedContracts = await createZip(contracts, people)

  res.setHeader('Content-Type', `application/zip`)
  return res.send(zippedContracts)
}

export const sendContracts = async (res, people, contracts) => {
  if (contracts.length === 1) {
    return sendSingleContract(res, contracts[0])
  }

  return await zipAndSendContracts(res, people, contracts)
}
