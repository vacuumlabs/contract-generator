/* eslint-disable no-unused-vars */
/*
 * Load module from string containing its source code.
 *
 * This function uses eval. Bear in mind that evaled code has an access to all
 * local and global variables. That's the reason, why this code needs to be
 * isolated into a module.
 *
 */

module.exports = function(what) {
  const module = undefined
  var result
  try {
    // Evaled code can see all local and global variables here. We have
    // shadowed module variable, so only thing visible is empty module and window
    // object.
    eval(`result = ${what}`)
    return result // eslint-disable-line no-undef
  } catch (err) {}
}
