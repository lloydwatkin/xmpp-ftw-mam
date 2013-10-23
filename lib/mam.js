var builder  = require('ltx'),
    Base     = require('xmpp-ftw/lib/base')
    
var Mam = function() {}

Mam.prototype = new Base()

Mam.prototype.NS = 'urn:xmpp:mam:tmp'

Mam.prototype._events = {
    'xmpp.mam.query': 'query'
}

Mam.prototype.handles = function(stanza) {
    return false
}

Mam.prototype.handle = function(stanza) {
    return false
}

Mam.prototype.query = function(data, callback) {
    if ('function' !== typeof callback)
        return this._clientError('Missing callback', data)
        
    var stanza = new builder.Element('iq', { type: 'get', id: this._getId() })
    stanza.c('query', { xmlns: this.NS })
                                            
    this.manager.trackId(stanza.root().attr('id'), function(stanza) {
        if ('error' == stanza.attrs.type)
            return callback(self._parseError(stanza))
        callback(null, true)
    })
    this.client.send(stanza)
}

module.exports = Mam
