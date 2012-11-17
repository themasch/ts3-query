var util     = require('util')
  , abstract = require('./Abstract')

var InfoCommand = function(cmd, opts)
{
  if(!(this instanceof InfoCommand)) {
    return new InfoCommand(cmd, opts)
  }
  abstract.call(this, cmd, opts)
}

util.inherits(InfoCommand, abstract)

InfoCommand.prototype.parseResults = function(lines)
{
  var entries = []
  entries = entries.concat(lines.join('').split(" "))
  var result = {}
  entries.forEach(function(e) {
    var s = e.split("=")
    if(s[1] && s[1].replace)  {
      s[1] = s[1].replace(/\\s/g, ' ').replace(/\\\//g, '/')
    }
    result[s[0]] = s[1]
  })
  return result
}

module.exports = InfoCommand