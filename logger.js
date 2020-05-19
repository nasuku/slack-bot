const logToConsole=false

/**
 * simple logger util logs to the console with the current timestamp
 */
module.exports = (title, ...args) => {
  if (logToConsole) {
    console.log(`${title} (${new Date().toISOString()})`, ...args)
  }
}
