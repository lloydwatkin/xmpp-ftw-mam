'use strict';

var should = require('should')
  , Mam = require('../../index')
  , helper = require('../helper')

/* jshint -W030 */
describe('Mam', function() {

    var mam, socket, xmpp, manager

    before(function() {
        socket = new helper.SocketEventer()
        xmpp = new helper.XmppEventer()
        manager = {
            socket: socket,
            client: xmpp,
            trackId: function(id, callback) {
                if (typeof id !== 'object')
                    throw new Error('Stanza ID spoofing protection not in place')
                this.callback = callback
            },
            makeCallback: function(error, data) {
                this.callback(error, data)
            }
        }
        mam = new Mam()
        mam.init(manager)
    })

    beforeEach(function() {
        socket.removeAllListeners()
        xmpp.removeAllListeners()
        mam.init(manager)
    })

    describe('Preferences', function() {

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
            socket.send('xmpp.mam.preferences', {})
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
            socket.send('xmpp.mam.preferences', {}, true)
        })

        it('Errors if \'default\' key missing', function(done) {
            var request = {}
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal('Missing \'default\' key')
                error.request.should.eql(request)
                xmpp.removeAllListeners('stanza')
                done()
            }
            socket.send(
                'xmpp.mam.preferences',
                request,
                callback
            )
        })

        it('Sends expected stanza', function(done) {
            var request = { default: 'roster' }
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.type.should.equal('set')
                stanza.attrs.id.should.exist
                stanza.getChild('prefs', mam.NS)
                    .attrs.default
                    .should.equal(request.default)
                done()
            })
            socket.send('xmpp.mam.preferences', request, function() {})
        })

        it('Errors if \'always\' provided and not an array', function(done) {
            var request = { default: 'roster', always: true }
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal('\'always\' should be an array')
                error.request.should.eql(request)
                xmpp.removeAllListeners('stanza')
                done()
            }
            socket.send(
                'xmpp.mam.preferences',
                request,
                callback
            )
        })

        it('Sends expected stanza with \'always\' entries', function(done) {
            var request = {
                default: 'roster',
                always: [ 'romeo@shakespeare.lit', 'juliet@shakespeare.lit' ]
            }
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.type.should.equal('set')
                stanza.attrs.id.should.exist
                var always = stanza.getChild('prefs', mam.NS)
                    .getChild('always')
                    .getChildren('jid')
                always.length.should.equal(request.always.length)
                always[0].getText().should.equal(request.always[0])
                always[1].getText().should.equal(request.always[1])
                done()
            })
            socket.send('xmpp.mam.preferences', request, function() {})
        })

        it('Errors if \'never\' provided and not an array', function(done) {
            var request = { default: 'roster', never: false }
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal('\'never\' should be an array')
                error.request.should.eql(request)
                xmpp.removeAllListeners('stanza')
                done()
            }
            socket.send(
                'xmpp.mam.preferences',
                request,
                callback
            )
        })

        it('Sends expected stanza with \'never\' entries', function(done) {
            var request = {
                default: 'roster',
                never: [ 'oberon@shakespeare.lit', 'hamlet@shakespeare.lit' ]
            }
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.type.should.equal('set')
                stanza.attrs.id.should.exist
                var never = stanza.getChild('prefs', mam.NS)
                    .getChild('never')
                    .getChildren('jid')
                never.length.should.equal(request.never.length)
                never[0].getText().should.equal(request.never[0])
                never[1].getText().should.equal(request.never[1])
                done()
            })
            socket.send('xmpp.mam.preferences', request, function() {})
        })

    })

})
