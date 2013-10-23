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

    describe('Handles', function() {
        
        it('Returns false for non-iq stanzas', function() {
            mam.handles(ltx.parse('<message/>')).should.be.false
        })
        
    })

}) 
