import JSZip from 'jszip'

const createZip = async (contracts, people) => {
  const zip = new JSZip()
  const peopleIds = {}
  for (let i = 0; i < contracts.length; i++) {
    const contract = contracts[i]
    const person = people[i]
    const fileName = `${person.vacuumId}.pdf`
    if (zip.file(fileName)) {
      // check if the vacuumId is in peopleIds, if it is increment the counter
      if (peopleIds[person.vacuumId]) {
        peopleIds[person.vacuumId]++
      } else {
        peopleIds[person.vacuumId] = 1
      }
      // add the file to the zip with a new name
      zip.file(`${person.vacuumId}(${peopleIds[person.vacuumId]}).pdf`, contract)
    } else {
      zip.file(fileName, contract)
    }
  }
  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  })
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
