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
    var attrs = { xmlns: this.NS }
    if (data.id) attrs.queryid = data.id
    var query = stanza.c('query', attrs)
    
    if (data.with) query.c('with').t(data.with)
    if (data.start) query.c('start').t(data.start)
    if (data.end) query.c('end').t(data.end)
                                            
    this.manager.trackId(stanza.root().attr('id'), function(stanza) {
        if ('error' == stanza.attrs.type)
            return callback(self._parseError(stanza))
        callback(null, true)
    })
    this.client.send(stanza)
}

module.exports = Mam
