var builder  = require('ltx'),
    rsm      = require('xmpp-ftw/lib/utils/xep-0059'),
    delay    = require('xmpp-ftw/lib/utils/xep-0203'),
    Chat     = require('xmpp-ftw/lib/chat')

var Mam = function() {}

Mam.prototype = new Chat()

Mam.prototype.NS = 'urn:xmpp:mam:tmp'

Mam.prototype._events = {
    'xmpp.mam.query': 'query',
    'xmpp.mam.preferences': 'preferences'
}

Mam.prototype.handles = function(stanza) {
    if (!stanza.is('message') ||
        !stanza.getChild('result', this.NS)) return false
    return true
}

Mam.prototype.handle = function(stanza) {
    var result = stanza.getChild('result')
    var forwarded = result.getChild('forwarded')
    var message = forwarded.getChild('message')
    var data = { from: this._getJid(message.attrs.from) }
    this._getMessageContent(message, data)
    delay.parse(message.parent, data
    data.mam = {
        to: this._getJid(message.attrs.to)
    }
    if (result.attrs.id) data.mam.id = result.attrs.id
    if (message.attrs.id) data.id = message.attrs.id
    if (result.attrs.queryid)
        data.mam.queryId = result.attrs.queryid
    this.socket.emit('xmpp.mam.message', data)
    return true
}

Mam.prototype.query = function(data, callback) {
    if ('function' !== typeof callback)
        return this._clientError('Missing callback', data)

    var stanza = new builder.Element('iq', { type: 'get', id: this._getId() })
    var attrs = { xmlns: this.NS }
    if (data.queryId) attrs.queryid = data.queryId
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
    var types = [ 'always', 'never' ]
    for (var i = 0; i < types.length; ++i) {
        var type = types[i]
        if ('undefined' === typeof data[type]) continue
        if (!(data[type] instanceof Array))
            return this._clientError(
                '\'' + type + '\' should be an array',
                data,
                callback
            )
        var jids = stanza.c(type)
        data[type].forEach(function(jid) {
            jids.c('jid').t(jid)
        })
    }
    this.manager.trackId(stanza.root().attr('id'), function(stanza) {
        if ('error' == stanza.attrs.type)
            return callback(self._parseError(stanza))
        callback(null, true)
    })
    this.client.send(stanza)
}

module.exports = Mam
