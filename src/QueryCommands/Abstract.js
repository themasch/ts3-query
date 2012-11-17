var events = require('events')
  , util   = require('util')

var AbstractQC = function(cmd, opts)
{
  if(!(this instanceof AbstractQC)) {
    return new AbstractQC(cmd, opts)
  }
  events.EventEmitter.call(this)
  this.parameters = opts || {}

  this.command    = cmd  || 'help'
  this.on('data', this.onData.bind(this))
  this.result     = []
}

util.inherits(AbstractQC, events.EventEmitter)

AbstractQC.prototype.stringify = function()
{
  var str = this.command + ' '
  for(var key in this.parameters) {
    str += key + '=' + ("" + this.parameters[key]).replace(' ', '\\s')
  }
  return str
}

AbstractQC.prototype.parseResults = function(lines)
{
  return lines;
}

AbstractQC.prototype.onData = function(buf)
{
  var lines = buf.toString('utf-8').split("\n")
  var self  = this
  lines.forEach(function(l) {
    l = l.replace(/\r/g, '')
    if (l === '') {
      return
    }
    if (l.match(/^error id=\d+ msg=.*$/)){
      var exitStatus = l.match(/^error id=(\d+) msg=(.*)$/)
      var result = {
        err_id:  exitStatus[1],
        err_msg: exitStatus[2].replace(/\\s/g, ' ').replace(/\\\//g, '/'),
        body:    self.parseResults(self.result)
      }
      self.emit('done', result)
    } else {
      self.result.push(l)
    }
  })
}

AbstractQC.prototype.setCommand = function(cmd)
{
  this.command = cmd
  return this
}

AbstractQC.prototype.setParameter = function(name, value)
{
  this.parameters[name] = value
  return this
}

module.exports = AbstractQC