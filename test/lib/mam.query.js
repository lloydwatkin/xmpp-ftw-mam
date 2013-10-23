var should = require('should')
  , Mam = require('../../lib/mam')
  , ltx    = require('ltx')
  , helper = require('../helper')

describe('Mam', function() {

    var mam, socket, xmpp, manager

    before(function() {
        socket = new helper.Eventer()
        xmpp = new helper.Eventer()
        manager = {
            socket: socket,
            client: xmpp,
            trackId: function(id, callback) {
                this.callback = callback
            },
            makeCallback: function(error, data) {
                this.callback(error, data)
            }
        }
        mam = new Mam()
        mam.init(manager)
    })

    describe('Query', function() {
        
        it('Errors if no callback provided', function(done) {
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            socket.once('xmpp.error.client', function(error) {
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal('Missing callback')
                error.request.should.eql({})
                xmpp.removeAllListeners('stanza')
                done()
            })
            socket.emit('xmpp.mam.query', {})
        })
        
        it('Errors if non-functional callback provided', function(done) {
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            socket.once('xmpp.error.client', function(error) {
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal('Missing callback')
                error.request.should.eql({})
                xmpp.removeAllListeners('stanza')
                done()
            })
            socket.emit('xmpp.mam.query', {}, true)
        })

        it('Sends expected stanza', function(done) {
            var request = {} 
            
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.id.should.exist
                stanza.attrs.type.should.equal('get')
                stanza.getChild('query', mam.NS).should.exist
                done()
            })
            socket.emit('xmpp.mam.query', request, function() {})
        })

        it('Sends expected stanza with query id', function(done) {
            var request = { id: 'query-id-1' } 
            
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.id.should.exist
                stanza.attrs.type.should.equal('get')
                stanza.getChild('query', mam.NS).attrs.queryid
                    .should.equal(request.id)
                done()
            })
            socket.emit('xmpp.mam.query', request, function() {})
        })

        it('Sends expected stanza with query id', function(done) {
            var request = { with: 'juliet@shakespeare.lit' } 
            
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.id.should.exist
                stanza.attrs.type.should.equal('get')
                stanza.getChild('query', mam.NS)
                    .getChildText('with')
                    .should.equal(request.with)
                done()
            })
            socket.emit('xmpp.mam.query', request, function() {})
        })

        it('Sends expected stanza with start', function(done) {
            var request = { start: 'start-date-time' } 
            
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.id.should.exist
                stanza.attrs.type.should.equal('get')
                stanza.getChild('query', mam.NS)
                    .getChildText('start')
                    .should.equal(request.start)
                done()
            })
            socket.emit('xmpp.mam.query', request, function() {})
        })

        it('Sends expected stanza with end', function(done) {
            var request = { end: 'end-date-time' } 
            
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.id.should.exist
                stanza.attrs.type.should.equal('get')
                stanza.getChild('query', mam.NS)
                    .getChildText('end')
                    .should.equal(request.end)
                done()
            })
            socket.emit('xmpp.mam.query', request, function() {})
        })
    })

})