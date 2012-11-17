var util     = require('util')
  , abstract = require('./Abstract')

var ListCommand = function(cmd, opts)
{
  if(!(this instanceof ListCommand)) {
    return new ListCommand(cmd, opts)
  }
  abstract.call(this, cmd, opts)
}

util.inherits(ListCommand, abstract)

ListCommand.prototype.parseResults = function(lines)
{
  var entries = []
  lines.forEach(function(l) {
    entries = entries.concat(l.split("|"))
  })

  var result = []
  entries.forEach(function(e) {
    var lines = e.split(" ")
    var data  = {}
    lines.forEach(function(l) {
      var s = l.split("=")
      if(s[1] && s[1].replace)  {
        s[1] = s[1].replace(/\\s/g, ' ').replace(/\\\//g, '/')
      }
      data[s[0]] = s[1]
    })
    result.push(data)
  })
  return result
}

module.exports = ListCommand