'use strict';

var Mam    = require('../../index')
  , ltx    = require('ltx')
  , helper = require('../helper')

/* jshint -W030 */
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

    describe('Handles', function() {

        it('Returns false for IQ stanzas', function() {
            mam.handles(ltx.parse('<iq/>')).should.be.false
        })

        it('Returns false for message stanzas', function() {
            mam.handles(ltx.parse('<message/>')).should.be.false
        })

        it('Returns true for MAM result messages', function() {
            mam.handles(ltx.parse(
                '<message><result xmlns="' + mam.NS + '"/></message>'
            )).should.be.true
        })

    })

    describe('Handle', function() {

        it('Handles archived message', function(done) {
            socket.on('xmpp.mam.message', function(data) {
                data.from.should.eql({
                    domain: 'shakespeare.lit',
                    user: 'romeo',
                    resource: 'desktop'
                })
                data.content.should.equal('Message')
                data.format.should.equal('plain')
                data.delay.when.should.equal('2010-07-10T23:08:25Z')
                data.id.should.equal('message:1')

                data.mam.queryId.should.equal('queryid:1')
                data.mam.to.should.eql({
                    domain: 'shakespeare.lit',
                    user: 'juliet',
                    resource: 'hallroom'
                })
                data.mam.id.should.equal('result:1')
                done()
            })
            mam.handle(helper.getStanza('message'))
                .should.be.true
        })

    })

})
