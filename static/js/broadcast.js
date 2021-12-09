/* New console.log */
const broadcast = () => {
  // Invoke the original method with an additional parameters
  console.log.apply(this,
    [(new Date().toString())].concat([].slice.call(arguments))
  )
}

module.exports = broadcast
