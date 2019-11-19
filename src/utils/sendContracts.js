import archiver from 'archiver'

const createZip = async (contracts, ids) => {
  const zip = archiver('zip', {
    zlib: {level: 9},
  })

  contracts.forEach((contract, i) => {
    zip.append(contract, {name: `${ids[i]}.pdf`})
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

const zipAndSendContracts = async (res, ids, contracts) => {
  const zippedContracts = await createZip(contracts, ids)

  res.setHeader('Content-Type', `application/zip`)
  return res.send(zippedContracts)
}

export const sendContracts = async (res, ids, contracts) => {
  if (contracts.length === 1) {
    return sendSingleContract(res, contracts[0])
  }

  return await zipAndSendContracts(res, ids, contracts)
}
