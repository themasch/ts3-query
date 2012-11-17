var net    = require('net')
  , events = require('events')
  , util   = require('util')

var AbstractQueryCommand = require('./QueryCommands/Abstract')


var QueryClient = function(host, port)
{
  if (!(this instanceof QueryClient)) {
    return new QueryClient(host, port)
  }

  events.EventEmitter.call(this)
  
  this.host = host || 'localhost'
  this.port = port || 10011
  this.cmdq = []

  this.client = net.connect({
    port: this.port,
    host: this.host
  })

  this.ready = false

  var self = this;
  this.client.on('connect', function() {
    self.emit('connect')
  })
  
  this.client.on('data', this.onData.bind(this))
}

util.inherits(QueryClient, events.EventEmitter)

QueryClient.prototype.setReady = function()
{
  this.ready = true
  this.processQueue()
}

QueryClient.prototype.onData = function(buf)
{
  if(this.currentCommand) {
    this.currentCommand.emit('data', buf)
  }
  else {
    var lines = buf.toString('utf-8').split("\n")
    var self = this
    lines.forEach(function(l) {
      l = l.replace(/\r/g, '')
      if (l === '') {
        return
      }
      console.log('!>', l)
      if(l.match(/^Welcome to the TeamSpeak 3 ServerQuery interface/)) { // not nice
        self.setReady()
      }
    })
  }
}

QueryClient.prototype.processQueue = function()
{
  if (this.cmdq.length === 0) {
    return
  }
  if (this.ready !== true) {
    return
  }
  var cmd = this.cmdq.shift()
  if(!(cmd instanceof AbstractQueryCommand)) {
    throw "command is not a correct command: ".concat(JSON.stringify(cmd))
  }
  this.processCommand(cmd)
}

QueryClient.prototype.processCommand = function(command)
{
  if(this.ready !== true) {
    this.cmdq.push(command)
    return command
  }
  var msg = command.stringify()
  
  this.client.write(msg + "\n")
  this.currentCommand = command
  this.ready          = false // done exec other commands
  command.on('done', this.setReady.bind(this))
  return command
}

QueryClient.prototype.exec = function(command)
{
  return this.processCommand(command)
}


QueryClient.prototype.login = function(user, pass)
{
  var cmd = new AbstractQueryCommand('login ' + user + ' ' + pass)
  this.cmdq.unshift(cmd)
}

module.exports = QueryClient