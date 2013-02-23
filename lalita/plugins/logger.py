# coding: utf8


"""Log IRC activity to mongodb"""


import time
import datetime
import txmongo

from lalita import Plugin
from twisted.internet import defer


class LoggerPlugin(Plugin):
    u"Log to mongodb"

    def init(self, config):
        self.register(self.events.PUBLIC_MESSAGE, self.log_message)
        self.register(self.events.JOIN, self.user_joined)
        self.register(self.events.LEFT, self.user_left)
        self.register(self.events.QUIT, self.user_quit)
        self.config = config
        self.logging = False
        self.messages = None
        self.setup()

    def log_message(self, user, channel, msg):
        u"""Log message to a file"""
        if self.logging:
            return self.store(user=user, message=msg, channel=channel)

    def user_joined(self, user, channel):
        u"""Log user joined"""
        if self.logging:
            return self.store(user=user, message="user joined %s" % (channel,),
                    channel=channel)

    def user_left(self, user, channel):
        u"""Log user left"""
        if self.logging:
            return self.store(user=user, message="user left %s" % (channel,), 
                    channel=channel)

    def user_quit(self, user, msg):
        u"""Log user quit"""
        if self.logging:
           return self.store(user=user, message="disconnected: %s" % (msg,), 
                    channel="")

    def store(self, **d):
        u"""Store message in db"""
        date = self.get_date()
        now = self.get_time()
        d.update({"date": date, "time": now}) 
        self.logger.debug(d)
        p = self.messages.insert(d, safe=True)
        p.addCallback(self.message_inserted)
        return p

    def message_inserted(self, *args):
        u"""Debug callback"""
        self.logger.debug(args)

    @defer.inlineCallbacks
    def setup(self):
        u"""Setup the database and start logging"""
        mongo = yield txmongo.MongoConnection()
        self.messages = mongo.meteor.messages
        self.logging = True
        self.logger.info("Starting logging to %s", self.config.get("name",
            "mongodb"))

    def get_time(self):
        u"""Current time in human format"""
        return time.asctime(time.gmtime())

    def get_date(self):
        u"""UTC date. Format is coupled with client code"""
        d = datetime.datetime.utcnow()
        return "%02d/%02d/%s" % (d.month, d.day, d.year)

