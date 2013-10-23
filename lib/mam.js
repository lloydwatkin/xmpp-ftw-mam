var builder  = require('ltx'),
    Base     = require('xmpp-ftw/lib/base')
    
var Mam = function() {}

Mam.prototype = new Base()

Mam.prototype.NS = 'urn:xmpp:mam:tmp'

Mam.prototype._events = {}

Mam.prototype.handles = function(stanza) {
    return false
}

Mam.prototype.handle = function(stanza) {
    return false
}

module.exports = Mam
