# python -i server.py
# -> inteprets script then launches intepreter

from pusher import Pusher

pusher = Pusher(app_id=u'179417', key=u'7386b1954d49d1d73eea', secret=u'965f43fdf1bddf075abf')

def startSequence():
    pusher.trigger(u'oregla-channel', u'start_sequence', {})

def stopSequence():
    pusher.trigger(u'oregla-channel', u'stop_sequence', {})

def makeSound( data ):
    pusher.trigger(u'oregla-channel', u'make_sound', {u'wooop': data})

def subSucced():
    print 'new sub'

# pusher.bind(u'pusher::subscription_succeeded', sub)
response = pusher.channel_info(u'oregla-channel', [])

print response
