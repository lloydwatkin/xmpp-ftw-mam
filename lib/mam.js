var builder  = require('ltx'),
    Base     = require('xmpp-ftw/lib/base'),
    rsm      = require('xmpp-ftw/lib/utils/xep-0059')
    
var Mam = function() {}

Mam.prototype = new Base()

Mam.prototype.NS = 'urn:xmpp:mam:tmp'

Mam.prototype._events = {
    'xmpp.mam.query': 'query',
    'xmpp.mam.preferences': 'preferences'
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
    if (data.rsm) rsm.build(query, data.rsm)
    var self = this                              
    this.manager.trackId(stanza.root().attr('id'), function(stanza) {
        if ('error' == stanza.attrs.type)
            return callback(self._parseError(stanza))
        var query = stanza.getChild('query')
        var data = {}
        if (query.getChild('start')) data.start = query.getChildText('start')
        if (query.getChild('end')) data.end = query.getChildText('end')
        if (query.getChild('with')) data.with = query.getChildText('with')
        callback(null, data, rsm.parse(query))
    })
    this.client.send(stanza)
}

Mam.prototype.preferences = function(data, callback) {
    if ('function' !== typeof callback)
        return this._clientError('Missing callback', data)
    if (!data.default)
        return this._clientError('Missing \'default\' key', data, callback)

    var stanza = new builder.Element('iq', { type: 'set', id: this._getId() })
        .c('prefs', { xmlns: this.NS, default: data.default })

    var self = this
    this.manager.trackId(stanza.root().attr('id'), function(stanza) {
        if ('error' == stanza.attrs.type)
            return callback(self._parseError(stanza))
        callback(null, true)
    })
    this.client.send(stanza)
}

module.exports = Mam
