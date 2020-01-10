export const wait = async (time) =>
  new Promise((res) => {
    setTimeout(() => res(true), time)
  })
