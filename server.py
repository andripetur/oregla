from autobahn.asyncio.websocket import WebSocketServerProtocol, \
    WebSocketServerFactory

import json, thread, readchar

openConnections = 0
clientsArr = []

class MyServerProtocol(WebSocketServerProtocol):

    def onConnect(self, request):
        print("Client connecting: {0}".format(request.peer))

    def onOpen(self):
        global openConnections
        openConnections+=1
        print("     WebSocket connection openened.")
        print("     Nr of openConnections: {0}".format(openConnections))
        print "\n$: "

        clientsArr.append(self)

    def onMessage(self, payload, isBinary):
        pl = json.loads(payload)

        if pl['type'] == 'message' :
            # global clients
            for i in clientsArr :
                if not i == self : # dont send message to original sender
                    i.sendMessage(payload, isBinary)

    def onClose(self, wasClean, code, reason):
        global openConnections
        openConnections-=1
        print("WebSocket connection closed: {0}".format(reason))
        print("    Nr of openConnections: {0}".format(openConnections))
        clientsArr.remove(self)

def serverThread() :
    while True:
        key = raw_input('$: ' )
        # key = 'm'
        if key is 'h' :
            print '   h: help, \n   m: send message, \n   l: list commands, \n   c: send command.'
        elif key is 'l' :
            print '   st: start_sequence, \n   sp: stop_sequence'
        elif key is 'm' :
            sendMessageFromServer(raw_input('send server message:' ))

def sendMessageFromServer(message) :
    msg = { 'userId' : 'server',
            'content' : message,
            'type' : 'message' }
    jsonString = json.dumps(msg)
    for i in clientsArr :
        i.sendMessage(jsonString, isBinary=False)

if __name__ == '__main__':

    try:
        import asyncio
    except ImportError:
        import trollius as asyncio

    factory = WebSocketServerFactory(u"ws://127.0.0.1:9000")
    factory.protocol = MyServerProtocol

    loop = asyncio.get_event_loop()
    coro = loop.create_server(factory, '0.0.0.0', 9000)
    server = loop.run_until_complete(coro)

    thread.start_new_thread(serverThread, ())

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.close()
        loop.close()
